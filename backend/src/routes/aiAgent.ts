import express, { Request, Response } from 'express';
import { AIAgentService } from '../services/aiAgentService';
import { notificationService } from '../services/notificationService';
import { agentTaskManager } from '../services/agentTaskManager';

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

    // Notifications disabled for POC
    // const timestamp = new Date().toLocaleString();
    // console.log('📧 Sending notifications...');
    // const notificationResult = await notificationService.notifyBugDetected({
    //   issue,
    //   file,
    //   section,
    //   timestamp,
    // });
    // console.log('📧 Notification results:', notificationResult);

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
 * POST /api/ai-agent/fix-button-enhanced
 * Trigger AI agent with full 6-step workflow (JIRA + GitHub + WebSocket updates)
 */
router.post('/fix-button-enhanced', async (req: Request, res: Response) => {
  try {
    const { issue, file, section } = req.body;

    if (!issue || !file) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: issue and file',
      });
    }

    console.log('🤖 AI Agent Enhanced triggered:', { issue, file, section });

    // Call the enhanced AI agent service (returns taskId immediately)
    const result = await aiAgentService.fixBrokenButtonEnhanced({
      issue,
      file,
      section,
    });

    return res.json({
      success: true,
      taskId: result.taskId,
      message: 'AI Agent workflow started. Track progress via WebSocket or /task/:taskId endpoint.',
    });
  } catch (error: any) {
    console.error('Error in AI agent enhanced endpoint:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * GET /api/ai-agent/task/:taskId
 * Get the status of an agent task
 */
router.get('/task/:taskId', async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const task = agentTaskManager.getTask(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    return res.json({
      success: true,
      task,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
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
    const hasJiraConfig = !!(process.env.JIRA_HOST && process.env.JIRA_EMAIL && process.env.JIRA_API_TOKEN);

    return res.json({
      success: true,
      status: 'operational',
      config: {
        openai: hasOpenAIKey ? 'configured' : 'missing',
        github: hasGitHubToken ? 'configured' : 'missing',
        jira: hasJiraConfig ? 'configured' : 'missing',
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

