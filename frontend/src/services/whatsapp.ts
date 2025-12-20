import apiClient from '../utils/apiClient';
import { WhatsAppMatchResult, Stats } from '../types';

// 上传WhatsApp号码
export const uploadNumbers = async (file: File, industry: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('industry', industry);
  
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
