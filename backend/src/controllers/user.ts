import express from 'express';
import User, { UserRole, UserStatus } from '../models/User';
import bcrypt from 'bcryptjs';

// 获取所有用户控制器
export const getAllUsers = async (req: express.Request, res: express.Response) => {
  try {
    const { page = 1, limit = 10, status, role } = req.query;
    
    const query: any = {};
    if (status) query.status = status;
    if (role) query.role = role;
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit as string))
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(query);
    
    return res.status(200).json({
      status: 'success',
      message: 'Users retrieved successfully',
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          totalPages: Math.ceil(total / parseInt(limit as string))
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

// 获取单个用户控制器
export const getUserById = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      message: 'User retrieved successfully',
      data: user
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// 更新用户状态控制器
export const updateUserStatus = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // 验证状态值
    if (!Object.values(UserStatus).includes(status as UserStatus)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status value'
      });
    }
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // 不能修改管理员状态
    if (user.role === UserRole.ADMIN) {
      return res.status(403).json({
        status: 'error',
        message: 'Cannot modify admin user status'
      });
    }
    
    user.status = status as UserStatus;
    await user.save();
    
    return res.status(200).json({
      status: 'success',
      message: 'User status updated successfully',
      data: user
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// 更新用户角色控制器
export const updateUserRole = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    // 验证角色值
    if (!Object.values(UserRole).includes(role as UserRole)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role value'
      });
    }
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // 不能修改管理员角色
    if (user.role === UserRole.ADMIN) {
      return res.status(403).json({
        status: 'error',
        message: 'Cannot modify admin user role'
      });
    }
    
    user.role = role as UserRole;
    await user.save();
    
    return res.status(200).json({
      status: 'success',
      message: 'User role updated successfully',
      data: user
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// 重置用户密码控制器
export const resetUserPassword = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'New password is required'
      });
    }
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // 更新密码
    user.password = newPassword;
    await user.save();
    
    return res.status(200).json({
      status: 'success',
      message: 'User password reset successfully',
      data: user
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// 删除用户控制器
export const deleteUser = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // 不能删除管理员
    if (user.role === UserRole.ADMIN) {
      return res.status(403).json({
        status: 'error',
        message: 'Cannot delete admin user'
      });
    }
    
    await User.findByIdAndDelete(id);
    
    return res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
