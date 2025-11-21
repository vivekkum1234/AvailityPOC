import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';

import questionnaireRoutes from './routes/questionnaire';
import responseRoutes from './routes/response';
import submissionRoutes from './routes/submissions';
import userRoutes from './routes/users';
import payerRoutes from './routes/payers';
import mockPayerRoutes from './routes/mockPayer';
import x12CodesRoutes from './routes/x12Codes'; // NEW: X12 Code Lookup
import pdfExtractorRoutes from './routes/pdfExtractor'; // NEW: PDF Extractor
import aiAgentRoutes from './routes/aiAgent'; // NEW: AI Agent
import { errorHandler } from './middleware/errorHandler';
import { initializeWebSocket } from './websocket/agentWebSocket'; // NEW: WebSocket for AI Agent

const app = express();
const PORT = process.env.PORT || 3002;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3003',
    'http://localhost:3004',
    'https://availity-poc.dzpf4ynhdt2su.amplifyapp.com',
    process.env.FRONTEND_URL
  ].filter((url): url is string => Boolean(url)),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/questionnaires', questionnaireRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/users', userRoutes);
app.use('/api', payerRoutes);
app.use('/api/mock-payer', mockPayerRoutes);
app.use('/api/x12-codes', x12CodesRoutes); // NEW: X12 Code Lookup
app.use('/api/pdf-extractor', pdfExtractorRoutes); // NEW: PDF Extractor
app.use('/api/ai-agent', aiAgentRoutes); // NEW: AI Agent

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use(errorHandler);

// Create HTTP server and initialize WebSocket
const httpServer = createServer(app);
initializeWebSocket(httpServer);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 API docs: http://localhost:${PORT}/api`);
  console.log(`🔌 WebSocket server ready for real-time updates`);
});

export default app;
