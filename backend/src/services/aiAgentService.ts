import OpenAI from 'openai';
import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

// Disable SSL verification for development (fixes certificate issues)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GitHub configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT;
const REPO_OWNER = 'vivekkum1234';
const REPO_NAME = 'AvailityPOC';
const BASE_BRANCH = 'availity-poc';

interface FixButtonRequest {
  issue: string;
  file: string;
  section: string;
}

interface AgentResponse {
  success: boolean;
  message?: string;
  prUrl?: string;
  error?: string;
}

/**
 * AI Agent Service using OpenAI Assistants API
 * Analyzes code, identifies issues, and creates PRs with fixes
 */
export class AIAgentService {
  private octokit: Octokit;
  private assistantId: string | null = null;

  constructor() {
    if (!GITHUB_TOKEN) {
      console.warn('⚠️  GITHUB_TOKEN not found. PR creation will fail.');
    }
    
    this.octokit = new Octokit({
      auth: GITHUB_TOKEN,
    });
  }

  /**
   * Main method to fix the broken button
   */
  async fixBrokenButton(request: FixButtonRequest): Promise<AgentResponse> {
    try {
      console.log('🤖 AI Agent started...');
      console.log('📋 Issue:', request.issue);

      // Step 1: Read the file content
      const fileContent = await this.readFile(request.file);
      
      // Step 2: Use OpenAI to analyze and generate fix
      const fix = await this.analyzeAndGenerateFix(fileContent, request);
      
      // Step 3: Create a new branch and PR with the fix
      const prUrl = await this.createPullRequest(request.file, fix, request.issue);

      return {
        success: true,
        message: '✅ AI Agent successfully analyzed the code and created a PR with the fix!',
        prUrl,
      };
    } catch (error: any) {
      console.error('❌ AI Agent error:', error);
      return {
        success: false,
        error: error.message || 'Failed to process AI agent request',
      };
    }
  }

  /**
   * Read file content from the repository
   */
  private async readFile(filePath: string): Promise<string> {
    try {
      // Try to read from local filesystem first (for development)
      const localPath = path.join(process.cwd(), '..', filePath);
      if (fs.existsSync(localPath)) {
        return fs.readFileSync(localPath, 'utf-8');
      }

      // Fallback to GitHub API
      const { data } = await this.octokit.repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: filePath,
        ref: BASE_BRANCH,
      });

      if ('content' in data) {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }

      throw new Error('File not found');
    } catch (error) {
      console.error('Error reading file:', error);
      throw new Error(`Failed to read file: ${filePath}`);
    }
  }

  /**
   * Use OpenAI to analyze code and generate a fix
   */
  private async analyzeAndGenerateFix(fileContent: string, request: FixButtonRequest): Promise<string> {
    const prompt = `You are an expert TypeScript/React developer. Analyze this code and fix the issue.

**Issue:** ${request.issue}

**File:** ${request.file}

**Current Code:**
\`\`\`typescript
${fileContent}
\`\`\`

**Task:**
1. Find the "Take Me Home" button in the code
2. Add a proper onClick handler that navigates to the home page using React Router
3. Import useNavigate from 'react-router-dom' if not already imported
4. Return ONLY the complete fixed file content, no explanations

**Requirements:**
- The button should navigate to '/' (home page)
- Use React Router's useNavigate hook
- Maintain all existing code structure and formatting
- Only fix the broken button, don't change anything else`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert code fixer. Return only the complete fixed code without any markdown formatting or explanations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const fixedCode = response.choices[0]?.message?.content || '';
    
    // Remove markdown code blocks if present
    return fixedCode.replace(/```typescript\n?/g, '').replace(/```\n?/g, '').trim();
  }

  /**
   * Create a new branch and pull request with the fix
   */
  private async createPullRequest(filePath: string, fixedContent: string, issue: string): Promise<string> {
    const branchName = `ai-agent/fix-take-me-home-button-${Date.now()}`;

    try {
      // Get the latest commit SHA from base branch
      const { data: refData } = await this.octokit.git.getRef({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        ref: `heads/${BASE_BRANCH}`,
      });
      const baseSha = refData.object.sha;

      // Create a new branch
      await this.octokit.git.createRef({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        ref: `refs/heads/${branchName}`,
        sha: baseSha,
      });

      // Get the current file to get its SHA
      const { data: fileData } = await this.octokit.repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: filePath,
        ref: BASE_BRANCH,
      });

      const fileSha = 'sha' in fileData ? fileData.sha : '';

      // Update the file in the new branch
      await this.octokit.repos.createOrUpdateFileContents({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: filePath,
        message: `🤖 AI Agent: Fix broken "Take Me Home" button\n\n${issue}`,
        content: Buffer.from(fixedContent).toString('base64'),
        branch: branchName,
        sha: fileSha,
      });

      // Create pull request
      const { data: pr } = await this.octokit.pulls.create({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        title: '🤖 AI Agent: Fix broken "Take Me Home" button',
        head: branchName,
        base: BASE_BRANCH,
        body: `## 🤖 AI Agent Automated Fix

**Issue Detected:**
${issue}

**Changes Made:**
- Added proper onClick handler to "Take Me Home" button
- Imported useNavigate from react-router-dom
- Button now navigates to home page (/)

**File Modified:**
- \`${filePath}\`

---
*This PR was automatically created by the AI Agent system.*`,
      });

      console.log('✅ Pull request created:', pr.html_url);
      return pr.html_url;
    } catch (error: any) {
      console.error('Error creating PR:', error);
      throw new Error(`Failed to create pull request: ${error.message}`);
    }
  }
}

