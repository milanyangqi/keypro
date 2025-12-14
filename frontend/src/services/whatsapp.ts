import apiClient from '../utils/apiClient';
import { MatchResult, Stats } from '../types';

// 上传WhatsApp号码
export const uploadNumbers = async (file: File, industry: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('industry', industry);
  
  return apiClient.post('/whatsapp/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// 匹配WhatsApp号码
export const matchNumbers = async (numbers: string[]): Promise<MatchResult> => {
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
  return apiClient.get('/whatsapp', { params });
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
  return apiClient.delete(`/whatsapp/${id}`);
};

// 批量删除WhatsApp号码
export const deleteNumbers = async (ids: string[]) => {
  return apiClient.post('/whatsapp/batch/delete', { ids });
};
