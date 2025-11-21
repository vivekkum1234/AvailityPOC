import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3002';

export interface StepStatus {
  status: 'pending' | 'in-progress' | 'complete' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  message?: string;
  error?: string;
  progress?: number;
  data?: any;
}

export interface ActivityLogEntry {
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export interface AgentTask {
  id: string;
  status: 'pending' | 'in-progress' | 'complete' | 'failed';
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
 * Custom hook to connect to WebSocket and receive real-time agent updates
 */
export function useAgentWebSocket(taskId: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [task, setTask] = useState<AgentTask | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connect to WebSocket
  useEffect(() => {
    if (!taskId) return;

    console.log(`🔌 Connecting to WebSocket for task: ${taskId}`);

    const newSocket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setConnected(true);
      setError(null);

      // Subscribe to task updates
      newSocket.emit('subscribe-task', taskId);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('❌ WebSocket connection error:', err);
      setError('Failed to connect to server');
      setConnected(false);
    });

    // Listen for task updates
    newSocket.on('task-update', (updatedTask: AgentTask) => {
      console.log('📥 Received task update:', updatedTask);
      setTask(updatedTask);
    });

    // Listen for step updates
    newSocket.on('step-update', (stepUpdate: any) => {
      console.log('📥 Received step update:', stepUpdate);
      // Step updates are already included in task-update, but we can use this for animations
    });

    // Listen for activity log entries
    newSocket.on('activity-log', (logEntry: ActivityLogEntry) => {
      console.log('📥 Received activity log:', logEntry);
      // Activity logs are already included in task-update
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log('🔌 Disconnecting WebSocket');
      newSocket.emit('unsubscribe-task', taskId);
      newSocket.disconnect();
    };
  }, [taskId]);

  // Fetch initial task data
  const fetchTask = useCallback(async () => {
    if (!taskId) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/ai-agent/task/${taskId}`);
      const data = await response.json();

      if (data.success) {
        setTask(data.task);
      } else {
        setError(data.error || 'Failed to fetch task');
      }
    } catch (err: any) {
      console.error('❌ Error fetching task:', err);
      setError(err.message || 'Failed to fetch task');
    }
  }, [taskId]);

  // Fetch task on mount
  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  return {
    task,
    connected,
    error,
    refetch: fetchTask,
  };
}

