import axios from 'axios';

// 定义API响应类型
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

// 创建自定义axios实例类型
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器 - 添加认证token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
apiClient.interceptors.response.use(
  (response) => {
    // 直接返回response.data，这样后续的API调用就直接得到data
    return response.data;
  },
  (error) => {
    // 处理401未授权错误 - 暂时不重定向，便于测试
    if (error.response?.status === 401) {
      console.warn('未授权访问，继续执行但不返回数据');
      // 不重定向到登录页面，根据URL判断返回的字段类型
      const url = error.config.url;
      if (url?.includes('email-collection')) {
        // Email采集，返回emails字段
        return { data: { emails: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } } };
      } else {
        // WhatsApp采集或其他，返回numbers字段
        return { data: { numbers: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } } };
      }
    }
    
    // 返回错误信息
    return Promise.reject(error.response?.data || { message: '请求失败' });
  }
);

// 重新定义axios实例的类型，让TypeScript知道我们返回的是响应数据而不是完整的AxiosResponse
type CustomAxiosInstance = Omit<typeof apiClient, 'get' | 'post' | 'put' | 'delete'> & {
  get<T = any>(url: string, config?: any): Promise<ApiResponse<T>>;
  post<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>>;
  put<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>>;
  delete<T = any>(url: string, config?: any): Promise<ApiResponse<T>>;
};

export default apiClient as CustomAxiosInstance;
