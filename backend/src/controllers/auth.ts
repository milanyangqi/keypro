import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { UserRole, UserStatus } from '../models/User';

// 注册控制器
export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { username, email, password, role } = req.body;

    // 验证输入 - email设为可选
    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide username and password'
      });
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Username already exists'
      });
    }

    // 检查邮箱是否已存在（如果提供了邮箱）
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          status: 'error',
          message: 'Email already exists'
        });
      }
    }

    // 创建新用户 - 支持传入role参数
    // 将空邮箱转换为null，避免唯一索引冲突
    const user = new User({
      username,
      email: email || null, // 设为可选，默认为null
      password,
      role: role || UserRole.USER, // 支持传入role，默认为USER
      status: UserStatus.ACTIVE // 管理员添加的用户直接设为ACTIVE状态
    });

    // 保存用户
    await user.save();

    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully. Please wait for admin approval.'
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// 登录控制器
export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { username, password } = req.body;

    // 验证输入
    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide username and password'
      });
    }

    // 查找用户
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid username or password'
      });
    }

    // 检查用户状态
    if (user.status !== UserStatus.ACTIVE) {
      return res.status(403).json({
        status: 'error',
        message: user.status === UserStatus.PENDING ? 'Your account is pending approval' : 'Your account is disabled'
      });
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid username or password'
      });
    }

    // 更新最后登录时间
    user.lastLogin = new Date();
    await user.save();

    // 生成JWT令牌
    const token = (jwt.sign as any)(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'keypro_trade_jwt_secret_key_2024',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// 刷新令牌控制器
export const refreshToken = async (req: express.Request, res: express.Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: 'Token is required'
      });
    }

    // 验证令牌
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'keypro_trade_jwt_secret_key_2024'
    ) as any;

    // 查找用户
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
    }

    // 生成新令牌
    const newToken = (jwt.sign as any)(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'keypro_trade_jwt_secret_key_2024',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(200).json({
      status: 'success',
      message: 'Token refreshed successfully',
      data: {
        token: newToken
      }
    });
  } catch (error: any) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token'
    });
  }
};

// 获取用户信息控制器
export const getProfile = async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized'
      });
    }

    // 查找用户
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Profile retrieved successfully',
      data: user
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
