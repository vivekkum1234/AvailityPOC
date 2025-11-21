import axios, { AxiosInstance } from 'axios';

// Disable SSL verification for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const JIRA_HOST = process.env.JIRA_HOST || '';
const JIRA_EMAIL = process.env.JIRA_EMAIL || '';
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN || '';
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY || 'SCRUM';

interface JiraTicket {
  id: string;
  key: string;
  self: string;
  url: string;
}

interface JiraComment {
  id: string;
  self: string;
  created: string;
}

/**
 * Service for integrating with JIRA API
 * Handles ticket creation, commenting, and updates
 */
export class JiraIntegrationService {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor() {
    if (!JIRA_HOST || !JIRA_EMAIL || !JIRA_API_TOKEN) {
      console.warn('⚠️  JIRA credentials not configured. JIRA integration will be disabled.');
    }

    this.baseUrl = `https://${JIRA_HOST}/rest/api/3`;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      auth: {
        username: JIRA_EMAIL,
        password: JIRA_API_TOKEN,
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get the active sprint ID for the project
   */
  private async getActiveSprintId(): Promise<number | null> {
    try {
      // Get board ID for the project
      const boardsResponse = await this.client.get('/board', {
        params: {
          projectKeyOrId: JIRA_PROJECT_KEY,
          type: 'scrum',
        },
      });

      if (!boardsResponse.data.values || boardsResponse.data.values.length === 0) {
        console.warn('⚠️  No Scrum board found for project');
        return null;
      }

      const boardId = boardsResponse.data.values[0].id;

      // Get active sprint for the board
      const sprintsResponse = await this.client.get(`/board/${boardId}/sprint`, {
        params: {
          state: 'active',
        },
      });

      if (!sprintsResponse.data.values || sprintsResponse.data.values.length === 0) {
        console.warn('⚠️  No active sprint found');
        return null;
      }

      const activeSprint = sprintsResponse.data.values[0];
      console.log(`✅ Found active sprint: ${activeSprint.name} (ID: ${activeSprint.id})`);
      return activeSprint.id;
    } catch (error: any) {
      console.error('❌ Error getting active sprint:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Create a bug ticket in JIRA
   */
  async createBugTicket(summary: string, description: string, file: string): Promise<JiraTicket> {
    console.log('🎫 Creating JIRA bug ticket...');

    // Get active sprint ID
    const sprintId = await this.getActiveSprintId();

    const issueData: any = {
      fields: {
        project: {
          key: JIRA_PROJECT_KEY,
        },
        summary: `🤖 AI Agent: ${summary}`,
        description: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: '🤖 Issue detected by AI Agent\n\n',
                  marks: [{ type: 'strong' }],
                },
              ],
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'File: ', marks: [{ type: 'strong' }] },
                { type: 'text', text: `${file}\n\n` },
              ],
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Issue: ', marks: [{ type: 'strong' }] },
                { type: 'text', text: `${description}\n\n` },
              ],
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Detected at: ', marks: [{ type: 'strong' }] },
                { type: 'text', text: new Date().toLocaleString() },
              ],
            },
          ],
        },
        issuetype: {
          name: 'Bug', // Create as Bug type
        },
        priority: {
          name: 'Highest', // Set priority to Highest
        },
        labels: ['ai-agent', 'automated-detection'],
      },
    };

    // Add sprint if active sprint found
    if (sprintId) {
      issueData.fields.customfield_10020 = sprintId; // Sprint field (customfield_10020 is standard for sprint)
      console.log(`📌 Adding ticket to active sprint (ID: ${sprintId})`);
    }

    try {
      const response = await this.client.post('/issue', issueData);
      const ticket: JiraTicket = {
        id: response.data.id,
        key: response.data.key,
        self: response.data.self,
        url: `https://${JIRA_HOST}/browse/${response.data.key}`,
      };

      console.log(`✅ JIRA ticket created: ${ticket.key}`);
      console.log(`   URL: ${ticket.url}`);

      return ticket;
    } catch (error: any) {
      console.error('❌ Failed to create JIRA ticket:', error.response?.data || error.message);
      throw new Error(`Failed to create JIRA ticket: ${error.message}`);
    }
  }

  /**
   * Add a comment to a JIRA ticket
   */
  async addComment(ticketKey: string, commentText: string): Promise<JiraComment> {
    console.log(`💬 Adding comment to ${ticketKey}...`);

    const commentData = {
      body: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: commentText,
              },
            ],
          },
        ],
      },
    };

    try {
      const response = await this.client.post(`/issue/${ticketKey}/comment`, commentData);
      console.log(`✅ Comment added to ${ticketKey}`);
      
      return {
        id: response.data.id,
        self: response.data.self,
        created: response.data.created,
      };
    } catch (error: any) {
      console.error('❌ Failed to add comment:', error.response?.data || error.message);
      throw new Error(`Failed to add comment: ${error.message}`);
    }
  }
}

