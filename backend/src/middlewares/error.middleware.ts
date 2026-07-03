import { Request, Response, NextFunction } from 'express';

/**
 * Centralized express error handling middleware.
 */
export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[Global Error Middleware] Caught error:', err);

  const status = err.status || 500;
  const message = err.message || 'Terjadi kesalahan internal pada server.';

  res.status(status).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
}
