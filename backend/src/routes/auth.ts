import express from 'express';
import { register, login, refreshToken, getProfile } from '../controllers/auth';
import authMiddleware from '../middleware/auth';

const router = express.Router();

// 注册路由
router.post('/register', register);

// 登录路由
router.post('/login', login);

// 刷新令牌路由
router.post('/refresh', refreshToken);

// 获取用户信息路由（需要认证）
router.get('/profile', authMiddleware, getProfile);

export default router;
