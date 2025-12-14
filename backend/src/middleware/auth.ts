import express from 'express';
import jwt from 'jsonwebtoken';

// 认证中间件
const authMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    // 从请求头获取令牌
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Authorization header is required and must start with Bearer'
      });
    }

    // 提取令牌
    const token = authHeader.split(' ')[1];

    // 验证令牌
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'keypro_trade_jwt_secret_key_2024'
    ) as any;

    // 将用户信息添加到请求对象
    (req as any).user = {
      userId: decoded.userId,
      role: decoded.role
    };

    next();
  } catch (error: any) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token'
    });
  }
};

export default authMiddleware;
