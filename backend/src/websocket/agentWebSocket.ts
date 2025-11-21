import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { AgentTask } from '../services/agentTaskManager';

let io: SocketIOServer | null = null;

/**
 * Initialize WebSocket server for real-time agent updates
 */
export function initializeWebSocket(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 WebSocket client connected: ${socket.id}`);

    // Client subscribes to a specific task
    socket.on('subscribe-task', (taskId: string) => {
      console.log(`📡 Client ${socket.id} subscribed to task: ${taskId}`);
      socket.join(`task-${taskId}`);
    });

    // Client unsubscribes from a task
    socket.on('unsubscribe-task', (taskId: string) => {
      console.log(`📡 Client ${socket.id} unsubscribed from task: ${taskId}`);
      socket.leave(`task-${taskId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 WebSocket client disconnected: ${socket.id}`);
    });
  });

  console.log('✅ WebSocket server initialized');
  return io;
}

/**
 * Get the WebSocket server instance
 */
export function getWebSocketServer(): SocketIOServer | null {
  return io;
}

/**
 * Emit a task update to all subscribed clients
 */
export function emitTaskUpdate(taskId: string, task: AgentTask): void {
  if (!io) {
    console.warn('⚠️  WebSocket server not initialized');
    return;
  }

  io.to(`task-${taskId}`).emit('task-update', task);
  console.log(`📤 Emitted task update for: ${taskId}`);
}

/**
 * Emit a step update to all subscribed clients
 */
export function emitStepUpdate(
  taskId: string,
  stepName: string,
  status: string,
  message?: string,
  progress?: number
): void {
  if (!io) {
    console.warn('⚠️  WebSocket server not initialized');
    return;
  }

  io.to(`task-${taskId}`).emit('step-update', {
    stepName,
    status,
    message,
    progress,
    timestamp: new Date(),
  });

  console.log(`📤 Emitted step update for ${taskId}: ${stepName} - ${status}`);
}

/**
 * Emit an activity log entry to all subscribed clients
 */
export function emitActivityLog(
  taskId: string,
  message: string,
  type: 'info' | 'success' | 'error' | 'warning'
): void {
  if (!io) {
    console.warn('⚠️  WebSocket server not initialized');
    return;
  }

  io.to(`task-${taskId}`).emit('activity-log', {
    message,
    type,
    timestamp: new Date(),
  });

  console.log(`📤 Emitted activity log for ${taskId}: [${type}] ${message}`);
}

