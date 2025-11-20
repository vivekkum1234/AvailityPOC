import express, { Request, Response } from 'express';
import { AIAgentService } from '../services/aiAgentService';
import { notificationService } from '../services/notificationService';

const router = express.Router();
const aiAgentService = new AIAgentService();

/**
 * POST /api/ai-agent/fix-button
 * Trigger AI agent to analyze and fix the broken button
 */
router.post('/fix-button', async (req: Request, res: Response) => {
  try {
    const { issue, file, section } = req.body;

    if (!issue || !file) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: issue and file',
      });
    }

    console.log('🤖 AI Agent triggered:', { issue, file, section });

    // Send notifications (SMS + Email)
    const timestamp = new Date().toLocaleString();
    console.log('📧 Sending notifications...');

    const notificationResult = await notificationService.notifyBugDetected({
      issue,
      file,
      section,
      timestamp,
    });

    console.log('📧 Notification results:', notificationResult);

    // Call the AI agent service
    const result = await aiAgentService.fixBrokenButton({
      issue,
      file,
      section,
    });

    return res.json(result);
  } catch (error: any) {
    console.error('Error in AI agent endpoint:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * GET /api/ai-agent/status
 * Get AI agent service status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    const hasGitHubToken = !!(process.env.GITHUB_TOKEN || process.env.GITHUB_PAT);

    return res.json({
      success: true,
      status: 'operational',
      config: {
        openai: hasOpenAIKey ? 'configured' : 'missing',
        github: hasGitHubToken ? 'configured' : 'missing',
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;

