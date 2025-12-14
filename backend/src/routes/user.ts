import express from 'express';
import { 
  getAllUsers, 
  getUserById, 
  updateUserStatus, 
  updateUserRole, 
  resetUserPassword, 
  deleteUser 
} from '../controllers/user';
import authMiddleware from '../middleware/auth';
import adminMiddleware from '../middleware/admin';

const router = express.Router();

// 获取所有用户（管理员权限）
router.get('/', authMiddleware, adminMiddleware, getAllUsers);

// 获取单个用户（管理员权限）
router.get('/:id', authMiddleware, adminMiddleware, getUserById);

// 更新用户状态（管理员权限）
router.put('/:id/status', authMiddleware, adminMiddleware, updateUserStatus);

// 更新用户角色（管理员权限）
router.put('/:id/role', authMiddleware, adminMiddleware, updateUserRole);

// 重置用户密码（管理员权限）
router.put('/:id/reset-password', authMiddleware, adminMiddleware, resetUserPassword);

// 删除用户（管理员权限）
router.delete('/:id', authMiddleware, adminMiddleware, deleteUser);

export default router;
