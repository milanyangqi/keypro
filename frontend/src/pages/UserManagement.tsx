import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Popconfirm, 
  message, 
  Select, 
  Input, 
  Modal, 
  Form, 
  Space, 
  Tag,
  Card
} from 'antd';
import { 
  CheckOutlined, 
  CloseOutlined, 
  DeleteOutlined, 
  KeyOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { User, UserStatus, UserRole } from '../types';
import { getAllUsers, register, updateUserStatus, updateUserRole, resetUserPassword, deleteUser } from '../services/auth';

const { Option } = Select;
const { Search } = Input;

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [resetPasswordForm] = Form.useForm();
  const [addUserModalVisible, setAddUserModalVisible] = useState<boolean>(false);
  const [addUserForm] = Form.useForm();

  // 从API获取用户列表
  useEffect(() => {
    fetchUsers();
  }, []);

  // 获取用户列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      if (response.status === 'success') {
        setUsers(response.data.users);
      }
    } catch (error: any) {
      message.error(error.message || '获取用户列表失败！');
    } finally {
      setLoading(false);
    }
  };

  // 处理用户状态变更
  const handleStatusChange = async (userId: string, status: UserStatus) => {
    try {
      const response = await updateUserStatus(userId, status);
      if (response.status === 'success') {
        message.success('用户状态已更新！');
        fetchUsers(); // 刷新用户列表
      }
    } catch (error: any) {
      message.error(error.message || '更新用户状态失败！');
    }
  };

  // 处理用户角色变更
  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      const response = await updateUserRole(userId, role);
      if (response.status === 'success') {
        message.success('用户角色已更新！');
        fetchUsers(); // 刷新用户列表
      }
    } catch (error: any) {
      message.error(error.message || '更新用户角色失败！');
    }
  };

  // 处理用户删除
  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await deleteUser(userId);
      if (response.status === 'success') {
        message.success('用户已删除！');
        fetchUsers(); // 刷新用户列表
      }
    } catch (error: any) {
      message.error(error.message || '删除用户失败！');
    }
  };

  // 打开重置密码模态框
  const openResetPasswordModal = (user: User) => {
    setSelectedUser(user);
    setResetPasswordModalVisible(true);
  };

  // 处理重置密码
  const handleResetPassword = async (values: { newPassword: string }) => {
    if (!selectedUser) return;
    try {
      const response = await resetUserPassword(selectedUser._id, values.newPassword);
      if (response.status === 'success') {
        message.success('密码已重置！');
        setResetPasswordModalVisible(false);
        resetPasswordForm.resetFields();
      }
    } catch (error: any) {
      message.error(error.message || '重置密码失败！');
    }
  };

  // 处理添加用户
  const handleAddUser = async (values: { username: string; email?: string; role?: UserRole; password: string }) => {
    try {
      // 使用register API添加用户，并传递role参数
      // 将空email转换为null，避免后端验证错误
      const response = await register(values.username, values.email || null, values.password, values.role);
      if (response.status === 'success') {
        message.success('用户已添加！');
        setAddUserModalVisible(false);
        addUserForm.resetFields();
        fetchUsers(); // 刷新用户列表
      }
    } catch (error: any) {
      message.error(error.message || '添加用户失败！');
    }
  };

  // 表格列配置
  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 150
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 250
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: UserRole) => (
        <Select
          value={role}
          onChange={(value) => handleRoleChange(users.find(u => u.role === role)?._id || '', value)}
          style={{ width: 100 }}
          disabled={role === UserRole.ADMIN}
        >
          <Option value={UserRole.ADMIN}>管理员</Option>
          <Option value={UserRole.USER}>用户</Option>
        </Select>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: UserStatus, record: User) => (
        <Space>
          {status === UserStatus.ACTIVE ? (
            <Tag color="green">已激活</Tag>
          ) : status === UserStatus.PENDING ? (
            <Tag color="orange">待审核</Tag>
          ) : (
            <Tag color="red">已禁用</Tag>
          )}
          {record.role !== UserRole.ADMIN && (
            <Space>
              {status === UserStatus.PENDING && (
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  onClick={() => handleStatusChange(record._id, UserStatus.ACTIVE)}
                  size="small"
                />
              )}
              {status === UserStatus.ACTIVE && (
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={() => handleStatusChange(record._id, UserStatus.DISABLED)}
                  size="small"
                />
              )}
              {status === UserStatus.DISABLED && (
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  onClick={() => handleStatusChange(record._id, UserStatus.ACTIVE)}
                  size="small"
                />
              )}
            </Space>
          )}
        </Space>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 200,
      render: (date: string | undefined) => date ? new Date(date).toLocaleString() : '从未登录'
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: User) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<KeyOutlined />}
            onClick={() => openResetPasswordModal(record)}
            size="small"
          >
            重置密码
          </Button>
          {record.role !== UserRole.ADMIN && (
            <Popconfirm
              title="确定要删除这个用户吗？"
              onConfirm={() => handleDeleteUser(record._id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
              >
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24, fontSize: 24, fontWeight: 600 }}>用户管理</h1>
      
      <Card>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Search
              placeholder="搜索用户名或邮箱"
              allowClear
              style={{ width: 300 }}
              onSearch={(value) => console.log(value)} // 实际应该调用API搜索
            />
            <Button
              type="primary"
              onClick={() => setAddUserModalVisible(true)}
              icon={<PlusOutlined />}
            >
              添加用户
            </Button>
          </div>
          
          <Table
            columns={columns}
            dataSource={users}
            rowKey="_id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 个用户`
            }}
          />
        </Space>
      </Card>
      
      {/* 重置密码模态框 */}
      <Modal
        title="重置密码"
        open={resetPasswordModalVisible}
        onCancel={() => {
          setResetPasswordModalVisible(false);
          resetPasswordForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={resetPasswordForm}
          layout="vertical"
          onFinish={handleResetPassword}
        >
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码！' },
              { min: 6, message: '密码长度不能少于6个字符！' }
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码！' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致！'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请确认新密码" />
          </Form.Item>
          
          <Form.Item style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setResetPasswordModalVisible(false);
                resetPasswordForm.resetFields();
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                确认重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 添加用户模态框 */}
      <Modal
        title="添加用户"
        open={addUserModalVisible}
        onCancel={() => {
          setAddUserModalVisible(false);
          addUserForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={addUserForm}
          layout="vertical"
          onFinish={handleAddUser}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名！' },
              { min: 3, message: '用户名长度不能少于3个字符！' }
            ]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { type: 'email', message: '请输入有效的邮箱地址！' }
            ]}
          >
            <Input placeholder="请输入邮箱（选填）" />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="角色"
          >
            <Select placeholder="请选择角色（默认：用户）">
              <Option value={UserRole.ADMIN}>管理员</Option>
              <Option value={UserRole.USER}>用户</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码！' },
              { min: 6, message: '密码长度不能少于6个字符！' }
            ]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          
          <Form.Item style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setAddUserModalVisible(false);
                addUserForm.resetFields();
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                确认添加
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
