import express from 'express';
import { 
  uploadNumbers, 
  matchNumbers, 
  getNumbers, 
  getNumberStats, 
  downloadTemplate,
  deleteNumber,
  deleteNumbers
} from '../controllers/whatsapp';
import authMiddleware from '../middleware/auth';
import upload from '../middleware/upload';

const router = express.Router();

// 上传WhatsApp号码（需要认证）
router.post('/upload', authMiddleware, upload.single('file'), uploadNumbers);

// 匹配WhatsApp号码（需要认证）
router.post('/match', authMiddleware, matchNumbers);

// 查询WhatsApp号码（需要认证）
router.get('/', authMiddleware, getNumbers);

// 获取WhatsApp号码统计（需要认证）
router.get('/stats', authMiddleware, getNumberStats);

// 下载模板文件（公开）
router.get('/template', downloadTemplate);

// 删除单个WhatsApp号码（需要认证）
router.delete('/:id', authMiddleware, deleteNumber);

// 批量删除WhatsApp号码（需要认证）
router.post('/batch/delete', authMiddleware, deleteNumbers);

export default router;
