import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
  uploadEmails, 
  matchEmails, 
  getEmails, 
  getEmailStats, 
  downloadTemplate, 
  deleteEmail, 
  deleteEmails 
} from '../controllers/email';
import authMiddleware from '../middleware/auth';

const router = express.Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // 允许的文件类型
    const allowedTypes = ['.txt', '.csv', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .txt, .csv, .xlsx, .xls files are allowed'));
    }
  }
});

// 上传邮箱
router.post('/upload', authMiddleware, upload.single('file'), uploadEmails);

// 匹配邮箱
router.post('/match', authMiddleware, matchEmails);

// 查询邮箱
router.get('/', authMiddleware, getEmails);

// 获取统计数据
router.get('/stats', authMiddleware, getEmailStats);

// 下载模板
router.get('/template', downloadTemplate);

// 删除单个邮箱
router.delete('/:id', authMiddleware, deleteEmail);

// 批量删除邮箱
router.post('/batch/delete', authMiddleware, deleteEmails);

export default router;
