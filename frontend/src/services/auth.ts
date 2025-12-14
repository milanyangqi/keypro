import apiClient from '../utils/apiClient';
import { User } from '../types';

// 登录请求
export const login = async (username: string, password: string) => {
  const response = await apiClient.post('/auth/login', { username, password });
  if (response.status === 'success') {
    // 保存token
    localStorage.setItem('token', response.data.token);
  }
  return response;
};

// 注册请求
export const register = async (username: string, email: string | null, password: string, role?: string) => {
  return apiClient.post('/auth/register', { username, email, password, role });
};

// 获取用户信息
export const getProfile = async (): Promise<User> => {
  const response = await apiClient.get('/auth/profile');
  return response.data;
};

// 刷新令牌
export const refreshToken = async (token: string) => {
  const response = await apiClient.post('/auth/refresh', { token });
  if (response.status === 'success') {
    localStorage.setItem('token', response.data.token);
  }
  return response;
};

// 获取所有用户
export const getAllUsers = async () => {
  const response = await apiClient.get('/users');
  return response;
};

// 更新用户状态
export const updateUserStatus = async (userId: string, status: string) => {
  const response = await apiClient.put(`/users/${userId}/status`, { status });
  return response;
};

// 更新用户角色
export const updateUserRole = async (userId: string, role: string) => {
  const response = await apiClient.put(`/users/${userId}/role`, { role });
  return response;
};

// 重置用户密码
export const resetUserPassword = async (userId: string, newPassword: string) => {
  const response = await apiClient.put(`/users/${userId}/reset-password`, { newPassword });
  return response;
};

// 删除用户
export const deleteUser = async (userId: string) => {
  const response = await apiClient.delete(`/users/${userId}`);
  return response;
};
