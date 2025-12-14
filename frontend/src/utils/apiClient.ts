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
    // 处理401未授权错误
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
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
