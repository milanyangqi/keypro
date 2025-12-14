import React, { useState } from 'react';
import { 
  Layout, Menu, Button, Avatar, Dropdown 
} from 'antd';
import {
  HomeOutlined,
  WhatsAppOutlined,
  DatabaseOutlined,
  ClockCircleOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  FormatPainterOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import { User } from '../types';

const { Header, Content, Sider } = Layout;

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  // 导航菜单项
  const menuItems = [
    {
      key: '1',
      icon: <HomeOutlined />,
      label: '首页',
      onClick: () => navigate('/dashboard')
    },
    {
      key: '2',
      icon: <WhatsAppOutlined />,
      label: 'WhatsApp号码管理',
      onClick: () => navigate('/dashboard/whatsapp-number-management')
    },
    {
      key: '6',
      icon: <FormatPainterOutlined />,
      label: 'WhatsApp号码格式化',
      onClick: () => navigate('/dashboard/whatsapp-number-formatter')
    },
    {
      key: '3',
      icon: <DatabaseOutlined />,
      label: 'WhatsApp号码采集',
      disabled: true,
      description: '后续开发'
    },
    {
      key: '4',
      icon: <ClockCircleOutlined />,
      label: '全球各地时间',
      onClick: () => navigate('/dashboard/global-time')
    },
    {
      key: '5',
      icon: <UserOutlined />,
      label: '用户管理',
      onClick: () => navigate('/dashboard/user-management'),
      hidden: user.role !== 'admin'
    }
  ];

  // 用户下拉菜单
  const userMenu = (
    <Menu
      items={[
        {
          key: '1',
          icon: <SettingOutlined />,
          label: '个人设置',
          onClick: () => {}
        },
        {
          key: '2',
          icon: <LogoutOutlined />,
          label: '退出登录',
          onClick: () => {
            onLogout();
            navigate('/login');
          }
        }
      ]}
    />
  );

  return (
    <Layout className="main-layout">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={260}
        collapsedWidth={80}
        style={{ background: '#001529', flex: '0 0 260px', width: '260px' }}
      >
        <div style={{ 
          height: 32, 
          margin: 16, 
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 'bold'
        }}>
          {collapsed ? '科浦诺' : '科浦诺外贸管理系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          items={menuItems.filter(item => !item.hidden)}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={collapsed ? <span style={{ fontSize: 16 }}>☰</span> : <span style={{ fontSize: 16 }}>☰</span>}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16 }}
            />
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#333' }}>
              科浦诺外贸管理系统
            </h1>
          </div>
          <Dropdown overlay={userMenu} trigger={['click']}>
            <Button
              type="text"
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Avatar>{user.username.charAt(0).toUpperCase()}</Avatar>
              <span style={{ marginRight: 4 }}>{user.username}</span>
              <span style={{ fontSize: 12, color: '#999' }}>({user.role})</span>
            </Button>
          </Dropdown>
        </Header>
        <Content style={{ padding: 24, background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
          <div className="content-wrapper">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
