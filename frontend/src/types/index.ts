// 用户角色枚举
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

// 用户状态枚举
export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  DISABLED = 'disabled'
}

// 用户类型
export interface User {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

// WhatsApp号码类型
export interface WhatsAppNumber {
  _id: string;
  number: string;
  industry: string;
  uploader: string | User;
  uploadTime: string;
  createdAt: string;
  updatedAt: string;
}

// Email类型
export interface Email {
  _id: string;
  email: string;
  industry: string;
  uploader: string | User;
  uploadTime: string;
  createdAt: string;
  updatedAt: string;
}

// 分页响应类型
export interface Pagination<T> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: T[];
}

// 统计数据类型
export interface Stats {
  total: number;
  industryStats: Array<{
    _id: string;
    count: number;
  }>;
  dateStats: Array<{
    _id: string;
    count: number;
  }>;
}

// 匹配结果类型
export interface MatchResult {
  matched: {
    count: number;
    numbers: WhatsAppNumber[];
  };
  unmatched: {
    count: number;
    numbers: string[];
  };
}

// WhatsApp匹配结果类型
export interface WhatsAppMatchResult {
  matched: {
    count: number;
    numbers: WhatsAppNumber[];
  };
  unmatched: {
    count: number;
    numbers: string[];
  };
}

// Email匹配结果类型
export interface EmailMatchResult {
  matched: {
    count: number;
    emails: Email[];
  };
  unmatched: {
    count: number;
    emails: string[];
  };
}
