/**
 * X12 Code Lookup API Routes
 * 
 * This route is SEPARATE from existing chatbot routes.
 * Provides AI-powered X12 code lookup from x12.org
 */

import express, { Request, Response } from 'express';
import { lookupX12Code } from '../services/aiCodeLookupService';

const router = express.Router();

/**
 * POST /api/x12-codes/lookup
 * 
 * Lookup X12 code information using AI
 * 
 * Request body:
 * {
 *   "query": "What is service type code 30?",
 *   "context": "User is on section: search-options" (optional)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "response": "Formatted AI response with code information",
 *   "source": "x12.org",
 *   "timestamp": "2025-01-16T10:30:00.000Z"
 * }
 */
router.post('/lookup', async (req: Request, res: Response) => {
  try {
    const { query, context } = req.body;
    
    // Validate input
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query is required and must be a string'
      });
    }
    
    console.log(`[X12 Code API] Received lookup request: "${query}"`);
    
    // Call the AI code lookup service
    const result = await lookupX12Code(query, context);
    
    // Return successful response
    res.json({
      success: true,
      response: result,
      source: 'x12.org',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[X12 Code API] Error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to lookup code information. Please try again later.',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;

