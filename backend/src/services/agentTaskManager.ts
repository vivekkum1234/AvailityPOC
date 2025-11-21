import { v4 as uuidv4 } from 'uuid';

export type TaskStatus = 'pending' | 'in-progress' | 'complete' | 'failed';

export interface StepStatus {
  status: TaskStatus;
  startedAt?: Date;
  completedAt?: Date;
  message?: string;
  error?: string;
  progress?: number; // 0-100
  data?: any; // Additional data (e.g., ticket ID, PR URL)
}

export interface ActivityLogEntry {
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export interface AgentTask {
  id: string;
  status: TaskStatus;
  startedAt: Date;
  completedAt?: Date;
  issue: string;
  file: string;
  section: string;

  steps: {
    createJiraTicket: StepStatus;
    addJiraComment: StepStatus;
    analyzeCode: StepStatus;
    generateFix: StepStatus;
    createPR: StepStatus;
    updateJira: StepStatus;
  };

  jiraTicketId?: string;
  jiraTicketKey?: string;
  jiraTicketUrl?: string;
  prUrl?: string;
  prNumber?: number;

  activityLog: ActivityLogEntry[];
}

/**
 * In-memory task manager for tracking agent tasks
 * In production, this would be backed by a database
 */
export class AgentTaskManager {
  private tasks: Map<string, AgentTask> = new Map();

  /**
   * Create a new agent task
   */
  createTask(issue: string, file: string, section: string): AgentTask {
    const taskId = `agent-task-${Date.now()}`;
    
    const task: AgentTask = {
      id: taskId,
      status: 'pending',
      startedAt: new Date(),
      issue,
      file,
      section,
      steps: {
        createJiraTicket: { status: 'pending' },
        addJiraComment: { status: 'pending' },
        analyzeCode: { status: 'pending' },
        generateFix: { status: 'pending' },
        createPR: { status: 'pending' },
        updateJira: { status: 'pending' },
      },
      activityLog: [
        {
          timestamp: new Date(),
          message: '🚀 Agent task started',
          type: 'info',
        },
      ],
    };

    this.tasks.set(taskId, task);
    console.log(`📋 Created task: ${taskId}`);
    
    return task;
  }

  /**
   * Get a task by ID
   */
  getTask(taskId: string): AgentTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Update a step status
   */
  updateStep(
    taskId: string,
    stepName: keyof AgentTask['steps'],
    status: TaskStatus,
    message?: string,
    data?: any
  ): void {
    const task = this.tasks.get(taskId);
    if (!task) {
      console.error(`❌ Task not found: ${taskId}`);
      return;
    }

    const step = task.steps[stepName];
    step.status = status;
    step.message = message;

    if (status === 'in-progress' && !step.startedAt) {
      step.startedAt = new Date();
    }

    if (status === 'complete' || status === 'failed') {
      step.completedAt = new Date();
    }

    if (data) {
      step.data = data;
    }

    console.log(`📝 Updated step ${stepName}: ${status} - ${message || ''}`);
  }

  /**
   * Update step progress (0-100)
   */
  updateStepProgress(taskId: string, stepName: keyof AgentTask['steps'], progress: number): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.steps[stepName].progress = progress;
  }

  /**
   * Add activity log entry
   */
  addLog(taskId: string, message: string, type: ActivityLogEntry['type'] = 'info'): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.activityLog.push({
      timestamp: new Date(),
      message,
      type,
    });

    console.log(`📝 [${type.toUpperCase()}] ${message}`);
  }

  /**
   * Update task status
   */
  updateTaskStatus(taskId: string, status: TaskStatus): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = status;

    if (status === 'complete' || status === 'failed') {
      task.completedAt = new Date();
    }
  }

  /**
   * Set JIRA ticket info
   */
  setJiraTicket(taskId: string, ticketId: string, ticketKey: string, ticketUrl: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.jiraTicketId = ticketId;
    task.jiraTicketKey = ticketKey;
    task.jiraTicketUrl = ticketUrl;
  }

  /**
   * Set PR info
   */
  setPR(taskId: string, prUrl: string, prNumber: number): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.prUrl = prUrl;
    task.prNumber = prNumber;
  }
}

// Singleton instance
export const agentTaskManager = new AgentTaskManager();

