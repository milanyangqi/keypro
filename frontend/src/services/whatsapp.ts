import apiClient from '../utils/apiClient';
import { WhatsAppMatchResult, Stats } from '../types';

// 上传WhatsApp号码
export const uploadNumbers = async (file: File, industry: string, keyword?: string, syntax?: string, platform?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('industry', industry);
  if (keyword) {
    formData.append('keyword', keyword);
  }
  if (syntax) {
    formData.append('syntax', syntax);
  }
  if (platform) {
    formData.append('platform', platform);
  }
  
  const response = await apiClient.post('/whatsapp/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// 匹配WhatsApp号码
export const matchNumbers = async (numbers: string[]): Promise<WhatsAppMatchResult> => {
  const response = await apiClient.post('/whatsapp/match', { numbers });
  return response.data;
};

// 查询WhatsApp号码
export const getNumbers = async (params: {
  date?: string;
  startDate?: string;
  endDate?: string;
  industry?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await apiClient.get('/whatsapp', { params });
  return response.data;
};

// 获取号码统计
export const getNumberStats = async (date?: string): Promise<Stats> => {
  const response = await apiClient.get('/whatsapp/stats', { params: { date } });
  return response.data;
};

// 下载模板文件
export const downloadTemplate = () => {
  // 创建下载链接
  const link = document.createElement('a');
  link.href = '/api/whatsapp/template';
  link.download = 'whatsapp-template.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 删除单个WhatsApp号码
export const deleteNumber = async (id: string) => {
  const response = await apiClient.delete(`/whatsapp/${id}`);
  return response.data;
};

// 批量删除WhatsApp号码
export const deleteNumbers = async (ids: string[]) => {
  const response = await apiClient.post('/whatsapp/batch/delete', { ids });
  return response.data;
};

// 导出WhatsApp号码
export const exportNumbers = async (ids: string[]) => {
  const response = await apiClient.post('/whatsapp/export', { ids });
  return response.data;
};

// 采集相关API

// 获取预设网站列表
export const getCollectionWebsites = async () => {
  const response = await apiClient.get('/whatsapp-collection/websites');
  return response;
};

// 获取支持的地区列表
export const getCollectionRegions = async () => {
  const response = await apiClient.get('/whatsapp-collection/regions');
  return response;
};

// 开始采集
export const startCollection = async (config: {
  name?: string;
  description?: string;
  config: {
    regions: string[];
    keywords: string[];
    sources: string[];
    pages?: number;
    delay?: number;
  };
}) => {
  const response = await apiClient.post('/whatsapp-collection/start', config);
  return response;
};

// 暂停采集
export const pauseCollection = async (taskId: string) => {
  const response = await apiClient.post(`/whatsapp-collection/${taskId}/pause`);
  return response;
};

// 继续采集
export const resumeCollection = async (taskId: string) => {
  const response = await apiClient.post(`/whatsapp-collection/${taskId}/resume`);
  return response;
};

// 停止采集
export const stopCollection = async (taskId: string) => {
  const response = await apiClient.post(`/whatsapp-collection/${taskId}/stop`);
  return response;
};

// 获取采集状态
export const getCollectionStatus = async (taskId: string) => {
  const response = await apiClient.get(`/whatsapp-collection/${taskId}/status`);
  return response;
};

// 获取采集结果
export const getCollectionResults = async (taskId: string, params: {
  page?: number;
  limit?: number;
}) => {
  let url = '/whatsapp-collection/results';
  if (taskId && taskId !== '' && taskId !== 'undefined' && taskId !== 'null') {
    url = `/whatsapp-collection/${taskId}/results`;
  }
  const response = await apiClient.get(url, { params });
  return response;
};

// 获取采集日志
export const getCollectionLogs = async (taskId: string) => {
  const response = await apiClient.get(`/whatsapp-collection/${taskId}/logs`);
  return response;
};

// 导出采集结果
export const exportCollectionResults = async (taskId: string, format: 'excel' | 'csv') => {
  const response = await apiClient.post('/whatsapp-collection/export', { taskId, format });
  return response;
};
