import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

// 导入页面组件
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WhatsAppNumberManagement from './pages/WhatsAppNumberManagement';
import WhatsAppNumberFormatter from './pages/WhatsAppNumberFormatter';
import WhatsAppNumberCollection from './pages/WhatsAppNumberCollection';
import GlobalTime from './pages/GlobalTime';
import GlobalWorldTime from './pages/GlobalWorldTime';
import ProductCatalogCreation1 from './pages/ProductCatalogCreation1';
import UserManagement from './pages/UserManagement';
import EmailManagement from './pages/EmailManagement';
import EmailCollection from './pages/EmailCollection';
import NotFound from './pages/NotFound';

// 导入服务
import { getProfile } from './services/auth';

// 导入类型
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 检查用户登录状态
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const profile = await getProfile();
        setUser(profile);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  // 初始化时检查登录状态
  useEffect(() => {
    checkAuth();
  }, []);

  // 处理登录成功
  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
  };

  // 处理登出
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    // 可以添加加载动画
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>加载中...</div>;
  }

  return (
    <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: '#667eea' } }}>
      <Router>
        <Routes>
          {/* 登录页面 */}
          <Route
            path="/login"
            element={<Login onLoginSuccess={handleLoginSuccess} />}
          />

          {/* 受保护的路由 */}
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
          >
            {/* 仪表盘子路由 */}
          <Route index element={<WhatsAppNumberManagement />} />
          <Route path="whatsapp-number-management" element={<WhatsAppNumberManagement />} />
          <Route path="whatsapp-number-formatter" element={<WhatsAppNumberFormatter />} />
          <Route path="whatsapp-number-collection" element={<WhatsAppNumberCollection />} />
          <Route path="email-management" element={<EmailManagement />} />
          <Route path="email-collection" element={<EmailCollection />} />
          <Route path="global-time" element={<GlobalTime />} />
          <Route path="global-world-time" element={<GlobalWorldTime />} />
          <Route path="product-catalog-creation-1" element={<ProductCatalogCreation1 />} />
          <Route path="user-management" element={<UserManagement />} />
          </Route>

          {/* 重定向根路径到登录 */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 404页面 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;
