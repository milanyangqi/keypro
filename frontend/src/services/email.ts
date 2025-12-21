import apiClient from '../utils/apiClient';
import axios from 'axios';
import { Email, EmailMatchResult, Stats } from '../types';

// 上传邮箱
export const uploadEmails = async (industry: string, file: File, keyword?: string, syntax?: string, platform?: string): Promise<any> => {
  const formData = new FormData();
  formData.append('industry', industry);
  formData.append('file', file);
  if (keyword) {
    formData.append('keyword', keyword);
  }
  if (syntax) {
    formData.append('syntax', syntax);
  }
  if (platform) {
    formData.append('platform', platform);
  }
  
  const response = await apiClient.post('/email/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

// 匹配邮箱
export const matchEmails = async (emails: string[]): Promise<EmailMatchResult> => {
  const response = await apiClient.post('/email/match', { emails });
  return response.data;
};

// 查询邮箱
export const getEmails = async (params: any): Promise<any> => {
  const response = await apiClient.get('/email', { params });
  return response.data;
};

// 获取邮箱统计
export const getEmailStats = async (params?: any): Promise<Stats> => {
  const response = await apiClient.get('/email/stats', { params });
  return response.data;
};

// 下载模板
export const downloadEmailTemplate = async (): Promise<void> => {
  // 使用axios直接请求，因为需要blob类型响应，而apiClient默认处理JSON
  const token = localStorage.getItem('token');
  const response = await axios.get('/api/email/template', { 
    responseType: 'blob',
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
    }
  });
  
  // 创建下载链接
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'email-template.xlsx');
  document.body.appendChild(link);
  link.click();
  
  // 清理
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// 删除单个邮箱
export const deleteEmail = async (id: string): Promise<Email> => {
  const response = await apiClient.delete(`/email/${id}`);
  return response.data;
};

// 批量删除邮箱
export const deleteEmails = async (ids: string[]): Promise<any> => {
  const response = await apiClient.post('/email/batch/delete', { ids });
  return response.data;
};

// 导出邮箱
export const exportEmails = async (ids: string[]): Promise<any> => {
  const response = await apiClient.post('/email/export', { ids });
  return response.data;
};

// E-mail采集相关API

// 获取预设网站列表
export const getEmailCollectionWebsites = async () => {
  const response = await apiClient.get('/email-collection/websites');
  return response;
};

// 获取支持的地区列表
export const getEmailCollectionRegions = async () => {
  const response = await apiClient.get('/email-collection/regions');
  return response;
};

// 开始采集
export const startEmailCollection = async (config: {
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
  const response = await apiClient.post('/email-collection/start', config);
  return response;
};

// 暂停采集
export const pauseEmailCollection = async (taskId: string) => {
  const response = await apiClient.post(`/email-collection/${taskId}/pause`);
  return response;
};

// 继续采集
export const resumeEmailCollection = async (taskId: string) => {
  const response = await apiClient.post(`/email-collection/${taskId}/resume`);
  return response;
};

// 停止采集
export const stopEmailCollection = async (taskId: string) => {
  const response = await apiClient.post(`/email-collection/${taskId}/stop`);
  return response;
};

// 获取采集状态
export const getEmailCollectionStatus = async (taskId: string) => {
  const response = await apiClient.get(`/email-collection/${taskId}/status`);
  return response;
};

// 获取采集结果
export const getEmailCollectionResults = async (taskId: string, params: {
  page?: number;
  limit?: number;
}) => {
  let url = '/email-collection/results';
  if (taskId && taskId !== '' && taskId !== 'undefined' && taskId !== 'null') {
    url = `/email-collection/${taskId}/results`;
  }
  const response = await apiClient.get(url, { params });
  return response;
};

// 获取采集日志
export const getEmailCollectionLogs = async (taskId: string) => {
  const response = await apiClient.get(`/email-collection/${taskId}/logs`);
  return response;
};

// 导出采集结果
export const exportEmailCollectionResults = async (taskId: string, format: 'excel' | 'csv') => {
  const response = await apiClient.post('/email-collection/export', { taskId, format });
  return response;
};