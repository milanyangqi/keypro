import express from 'express';
import {
  getWebsites,
  getRegions,
  startCollection,
  pauseCollection,
  resumeCollection,
  stopCollection,
  getCollectionStatus,
  getCollectionResults,
  getCollectionLogs,
  exportResults
} from '../controllers/email-collection';
import authMiddleware from '../middleware/auth';

const router = express.Router();

// 获取预设网站列表（需要认证）
router.get('/websites', authMiddleware, getWebsites);

// 获取支持的地区列表（需要认证）
router.get('/regions', authMiddleware, getRegions);

// 开始采集（需要认证）
router.post('/start', authMiddleware, startCollection);

// 暂停采集（需要认证）
router.post('/:taskId/pause', authMiddleware, pauseCollection);

// 继续采集（需要认证）
router.post('/:taskId/resume', authMiddleware, resumeCollection);

// 停止采集（需要认证）
router.post('/:taskId/stop', authMiddleware, stopCollection);

// 获取采集状态（需要认证）
router.get('/:taskId/status', authMiddleware, getCollectionStatus);

// 获取采集结果（需要认证）
router.get('/:taskId/results', authMiddleware, getCollectionResults);
// 无taskId的情况，直接返回用户的所有采集结果
router.get('/results', authMiddleware, getCollectionResults);

// 获取采集日志（需要认证）
router.get('/:taskId/logs', authMiddleware, getCollectionLogs);

// 导出采集结果（需要认证）
router.post('/export', authMiddleware, exportResults);

export default router;
