import express from 'express';
import { UserRole } from '../models/User';

// 管理员中间件
const adminMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const user = (req as any).user;
    
    if (!user || user.role !== UserRole.ADMIN) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin privileges required.'
      });
    }

    next();
  } catch (error: any) {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Admin privileges required.'
    });
  }
};

export default adminMiddleware;
