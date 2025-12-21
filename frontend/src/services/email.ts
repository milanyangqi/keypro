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