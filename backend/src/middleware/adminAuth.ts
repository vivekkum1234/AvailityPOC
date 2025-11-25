import { Request, Response, NextFunction } from 'express';
import { supabaseService } from '../services/supabaseService';
import { createError } from './errorHandler';

/**
 * Admin Authentication Middleware
 * Verifies that the user is an Availity admin
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    // Get user ID from request (set by auth middleware)
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      throw createError('Authentication required', 401);
    }

    // Get user from database
    const user = await supabaseService.getUser(userId);

    if (!user) {
      throw createError('User not found', 404);
    }

    // Check if user is admin
    if (!user.is_admin) {
      throw createError('Admin access required', 403);
    }

    // Attach user to request for downstream use
    (req as any).user = user;

    next();
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({
        error: error.message,
        statusCode: error.statusCode
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
}

/**
 * Optional Admin Check
 * Adds admin flag to request but doesn't block non-admins
 */
export async function checkAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (userId) {
      const user = await supabaseService.getUser(userId);
      if (user) {
        (req as any).user = user;
        (req as any).isAdmin = user.is_admin || false;
      }
    }

    next();
  } catch (error) {
    // Don't block on error, just continue without admin flag
    next();
  }
}

