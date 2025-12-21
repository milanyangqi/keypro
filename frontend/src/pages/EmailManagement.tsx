import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Row,
  Col,
  Card,
  Tabs,
  Table,
  DatePicker,
  Select,
  Space,
  Checkbox
} from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  SearchOutlined,
  DeleteOutlined,
  ClearOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  ExportOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { uploadEmails, getEmails, deleteEmail, deleteEmails, downloadEmailTemplate, matchEmails, exportEmails } from '../services/email';
import { Email, EmailMatchResult } from '../types';
import dayjs, { Dayjs } from 'dayjs';

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

const EmailManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [selectedRows, setSelectedRows] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState<Email[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(500);
  const [industry, setIndustry] = useState('餐饮');
  const [uploadResult, setUploadResult] = useState<{ matched: number; saved: number; chinaEmails?: number } | null>(null);
  const [searchForm] = Form.useForm();
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([dayjs(), dayjs()]);
  // 新增状态：用于文本输入和匹配结果
  const [emailsText, setEmailsText] = useState('');
  const [matchResult, setMatchResult] = useState<EmailMatchResult | null>(null);
  const [matching, setMatching] = useState(false);
  // 当前选中的标签页
  const [currentTab, setCurrentTab] = useState<string>('all');
  // 平台选项，移除了全球搜索引擎
  const platformOptions = [
    'Google', 'Bing', 'Yahoo', 'Facebook', 'LinkedIn', 'TikTok', 'Instagram',
    'Twitter', 'Pinterest', 'YouTube', 'Reddit', 'Quora', 'Amazon', 'AliExpress', '其他'
  ];
  
  // 自定义平台输入状态
  const [showCustomPlatform, setShowCustomPlatform] = useState(false);
  const [customPlatform, setCustomPlatform] = useState('');
  // 表格筛选状态
  const [filteredInfo, setFilteredInfo] = useState<{
    [key: string]: any;
  }>({});
  
  // 处理表格筛选和排序
  const handleTableChange = (_pagination: any, filters: any, _sorter: any) => {
    setFilteredInfo(filters);
  };
  // 复制邮箱到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => message.success('复制成功！'))
      .catch(() => message.error('复制失败！'));
  };

  // 加载邮箱列表
  const loadEmails = async (page: number = 1, size: number = 500, exported?: boolean) => {
    setLoading(true);
    try {
      const selectedIndustry = searchForm.getFieldValue('industry');
      const params: any = {
        page,
        limit: size
      };

      // 只有当exported参数被明确传递时才添加到查询条件中
      if (exported !== undefined) {
        params.exported = exported;
      }

      // 日期筛选
      if (dateRange[0]) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
      }
      
      if (dateRange[1]) {
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }

      // 行业筛选
      if (selectedIndustry && selectedIndustry !== '全部') {
        params.industry = selectedIndustry;
      }

      const response = await getEmails(params);
      setEmails(response.emails || []);
      setTotal(response.pagination?.total || 0);
    } catch (error: any) {
      message.error(error.message || '获取邮箱列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 导出功能
  const handleExport = async () => {
    try {
      // 检查是否有选中的邮箱
      if (selectedRows.length === 0) {
        message.warning('请先选择要导出的邮箱！');
        return;
      }
      
      // 调用导出接口
      const selectedIds = selectedRows.map(row => row._id);
      const data = await exportEmails(selectedIds);
      
      // 提取邮箱地址
      const emails = data.exportedEmails.map((item: any) => item.email);
      const emailsText = emails.join('\n');
      
      // 复制到剪贴板
      try {
        await navigator.clipboard.writeText(emailsText);
      } catch (clipboardError) {
        console.warn('剪贴板复制失败，将仅提供文件下载：', clipboardError);
      }
      
      // 创建并下载文本文件
      const blob = new Blob([emailsText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `emails-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      message.success(`导出成功！${emails.length}个邮箱已复制到剪贴板并下载为文件！`);
      
      // 重新加载数据，更新显示
      loadEmails(currentPage, pageSize);
    } catch (error: any) {
      message.error(error.message || '导出失败！');
    }
  };

  // 初始化加载数据和表单默认值
  useEffect(() => {
    loadEmails();
    // 设置表单默认行业为餐饮
    form.setFieldsValue({ industry: '餐饮' });
    // 查询表单默认行业为全部
    searchForm.setFieldsValue({ industry: '全部' });
  }, [dateRange]);

  // 修复日期范围默认值，使用null表示查询所有日期
  useEffect(() => {
    setDateRange([null, null]);
  }, []);

  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    if (!industry) {
      message.error('请先选择行业');
      return false;
    }

    setLoading(true);
    try {
      const result = await uploadEmails(industry, file);
      setUploadResult(result);
      message.success('邮箱上传成功');
      loadEmails();
    } catch (error: any) {
      message.error(error.message || '邮箱上传失败');
    } finally {
      setLoading(false);
    }

    return false; // 阻止自动上传，我们手动处理
  };

  // 处理单个删除
  const handleDelete = async (id: string) => {
    try {
      await deleteEmail(id);
      message.success('邮箱删除成功');
      loadEmails(currentPage, pageSize);
    } catch (error: any) {
      message.error(error.response?.data?.message || '邮箱删除失败');
    }
  };

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (selectedRows.length === 0) {
      message.warning('请选择要删除的邮箱');
      return;
    }

    try {
      const ids = selectedRows.map(row => row._id);
      await deleteEmails(ids);
      message.success(`成功删除 ${selectedRows.length} 个邮箱`);
      setSelectedRows([]);
      loadEmails(currentPage, pageSize);
    } catch (error: any) {
      message.error(error.response?.data?.message || '批量删除失败');
    }
  };



  // 处理搜索
  const handleSearch = (exported?: boolean) => {
    loadEmails(1, pageSize, exported);
  };

  // 处理清除筛选
  const handleClearFilters = () => {
    setDateRange([null, null]);
    searchForm.setFieldsValue({ industry: '全部' });
    loadEmails(1, pageSize); // 清除筛选后查询所有邮箱
  };

  // 处理行业变化
  const handleIndustryChange = (value: string) => {
    setIndustry(value);
  };

  // 处理下载模板
  const handleDownloadTemplate = async () => {
    try {
      await downloadEmailTemplate();
      message.success('模板下载成功');
    } catch (error) {
      message.error('模板下载失败');
    }
  };

  // 处理文本区域邮箱上传
  const handleTextUpload = async () => {
    if (!industry) {
      message.error('请先选择行业');
      return;
    }

    if (!emailsText.trim()) {
      message.error('请输入邮箱地址');
      return;
    }

    setMatching(true);
    try {
      // 将文本转换为数组
      const emailsArray = emailsText
        .split(/[\n,，\s]+/)
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (emailsArray.length === 0) {
        message.error('请输入有效的邮箱地址');
        return;
      }

      // 获取表单字段
      const keyword = form.getFieldValue('keyword');
      const syntax = form.getFieldValue('syntax');
      let platform = form.getFieldValue('platform');
      // 如果选择了其他，使用自定义平台值
      if (showCustomPlatform && customPlatform) {
        platform = customPlatform;
      }

      // 先匹配邮箱，获取已存在和新增的邮箱
      const matchResult = await matchEmails(emailsArray);
      setMatchResult(matchResult);
      message.success('邮箱匹配成功');

      // 然后将所有邮箱上传到数据库，后端会自动处理重复邮箱
      const blob = new Blob([emailsArray.join('\n')], { type: 'text/plain' });
      const file = new File([blob], 'emails.txt', { type: 'text/plain' });
      const uploadResult = await uploadEmails(industry, file, keyword, syntax, platform);
      setUploadResult(uploadResult);
      loadEmails(); // 重新加载邮箱列表
    } catch (error: any) {
      message.error(error.message || '邮箱匹配失败');
    } finally {
      setMatching(false);
    }
  };



  // 处理全选
  const handleSelectAll = (e: any) => {
    if (e.target.checked) {
      setSelectedRows(emails);
    } else {
      setSelectedRows([]);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: <Checkbox checked={selectedRows.length === emails.length && emails.length > 0} onChange={handleSelectAll} />,
      key: 'selection',
      width: 60,
      render: (_: any, record: Email) => (
        <Checkbox
          checked={selectedRows.some(row => row._id === record._id)}
          onChange={(e: any) => {
            if (e.target.checked) {
              setSelectedRows([...selectedRows, record]);
            } else {
              setSelectedRows(selectedRows.filter(row => row._id !== record._id));
            }
          }}
        />
      )
    },
    {
      title: '邮箱地址',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true
    },
    {
      title: '行业',
      dataIndex: 'industry',
      key: 'industry',
      ellipsis: true,
      filters: [
        { text: '全部', value: '全部' },
        { text: '电子', value: '电子' },
        { text: '机械', value: '机械' },
        { text: '化工', value: '化工' },
        { text: '纺织', value: '纺织' },
        { text: '服装', value: '服装' },
        { text: '食品', value: '食品' },
        { text: '医药', value: '医药' },
        { text: '能源', value: '能源' },
        { text: '建筑', value: '建筑' },
        { text: '餐饮', value: '餐饮' },
        { text: '其他', value: '其他' }
      ],
      filteredValue: filteredInfo.industry || null,
      onFilter: (value: any, record: Email) => {
        if (value === '全部') return true;
        return record.industry === value;
      }
    },
    {
      title: '关键词',
      dataIndex: 'keyword',
      key: 'keyword',
      ellipsis: true,
      // 动态生成关键词筛选选项
      filters: Array.from(new Set(emails.map(email => email.keyword).filter(Boolean))).map(keyword => ({
        text: keyword as string,
        value: keyword as string
      })),
      filteredValue: filteredInfo.keyword || null,
      onFilter: (value: any, record: Email) => record.keyword === value
    },
    {
      title: '语法',
      dataIndex: 'syntax',
      key: 'syntax',
      ellipsis: true,
      // 动态生成语法筛选选项
      filters: Array.from(new Set(emails.map(email => email.syntax).filter(Boolean))).map(syntax => ({
        text: syntax as string,
        value: syntax as string
      })),
      filteredValue: filteredInfo.syntax || null,
      onFilter: (value: any, record: Email) => record.syntax === value
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      ellipsis: true,
      // 动态生成平台筛选选项
      filters: Array.from(new Set(emails.map(email => email.platform).filter(Boolean))).map(platform => ({
        text: platform as string,
        value: platform as string
      })),
      filteredValue: filteredInfo.platform || null,
      onFilter: (value: any, record: Email) => record.platform === value
    },
    {
      title: '上传者',
      dataIndex: 'uploader',
      key: 'uploader',
      ellipsis: true,
      render: (uploader: any) => {
        if (typeof uploader === 'string') {
          return uploader;
        }
        return uploader.username || uploader.email;
      },
      // 动态生成上传者筛选选项
      filters: Array.from(new Set(emails.map(email => {
        const uploaderName = typeof email.uploader === 'string' ? email.uploader : email.uploader?.username || email.uploader?.email;
        return uploaderName || '';
      }).filter(Boolean))).map(uploader => ({
        text: uploader as string,
        value: uploader as string
      })),
      filteredValue: filteredInfo.uploader || null,
      onFilter: (value: any, record: Email) => {
        const uploaderName = typeof record.uploader === 'string' ? record.uploader : record.uploader?.username || record.uploader?.email;
        return uploaderName === value;
      }
    },
    {
      title: '上传时间',
      dataIndex: 'uploadTime',
      key: 'uploadTime',
      ellipsis: true,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      ellipsis: true,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Email) => (
        <Space size="middle">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  // 分页配置
  const paginationConfig = {
    current: currentPage,
    pageSize: pageSize,
    total: total,
    onChange: (page: number, size: number) => {
      setCurrentPage(page);
      setPageSize(size);
      // 根据当前选中的标签页重新查询数据
      if (currentTab === 'all') {
        loadEmails(page, size);
      } else if (currentTab === 'notExported') {
        loadEmails(page, size, false);
      } else if (currentTab === 'exported') {
        loadEmails(page, size, true);
      }
    },
    showSizeChanger: true,
    pageSizeOptions: ['50', '100', '200', '500', '1000', '2000', '5000'],
    showTotal: (total: number) => `共 ${total} 条记录`
  };

  return (
    <div>
      <Card>
        <Tabs defaultActiveKey="1">
          {/* 邮箱上传标签页 */}
          <TabPane tab="邮箱上传" key="1">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFileUpload}
            >
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Form.Item
                    name="industry"
                    label="行业分类"
                    rules={[{ required: true, message: '请选择行业' }]}
                  >
                    <Select
                    placeholder="请选择行业"
                    onChange={handleIndustryChange}
                    defaultValue="餐饮"
                  >
                      <Option value="">请选择行业</Option>
                      <Option value="电子">电子</Option>
                      <Option value="机械">机械</Option>
                      <Option value="化工">化工</Option>
                      <Option value="纺织">纺织</Option>
                      <Option value="服装">服装</Option>
                      <Option value="食品">食品</Option>
                      <Option value="医药">医药</Option>
                      <Option value="能源">能源</Option>
                      <Option value="建筑">建筑</Option>
                      <Option value="餐饮">餐饮</Option>
                      <Option value="其他">其他</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="keyword"
                    label="关键词"
                  >
                    <Input placeholder="请输入关键词（非必填）" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="syntax"
                    label="语法"
                  >
                    <Input placeholder="请输入语法（非必填）" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="platform"
                    label="平台"
                  >
                    <Select 
                      placeholder="请选择平台（非必填）"
                      onChange={(value) => {
                        setShowCustomPlatform(value === '其他');
                        if (value === '其他') {
                          // 清空平台值，使用自定义值
                          form.setFieldValue('platform', '');
                        } else {
                          setCustomPlatform('');
                        }
                      }}
                    >
                      {platformOptions.map(platform => (
                        <Option key={platform} value={platform}>{platform}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                {/* 自定义平台输入 */}
                {showCustomPlatform && (
                  <Col span={24}>
                    <Form.Item
                      label="自定义平台"
                      help="请输入自定义平台名称"
                    >
                      <Input 
                        placeholder="请输入自定义平台"
                        value={customPlatform}
                        onChange={(e) => {
                          setCustomPlatform(e.target.value);
                          form.setFieldValue('platform', e.target.value);
                        }}
                      />
                    </Form.Item>
                  </Col>
                )}
              </Row>

              <Form.Item
                name="file"
                label="上传邮箱文件"
              >
                <Upload
                  name="file"
                  accept=".txt,.csv,.xlsx,.xls"
                  beforeUpload={handleFileUpload}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />}>选择文件</Button>
                </Upload>
                <span style={{ marginLeft: 16 }}>支持的文件格式：.txt, .csv, .xlsx, .xls</span>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 16 }}>
                  上传文件
                </Button>
                <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
                  下载模板
                </Button>
              </Form.Item>

              {/* 上传结果 */}
              {uploadResult && (
                <Card title="上传结果" type="inner" size="small">
                  <Row gutter={16}>
                    <Col span={8}>
                      <p>已存在邮箱：<strong>{uploadResult.matched}</strong> 个</p>
                    </Col>
                    <Col span={8}>
                      <p>新增邮箱：<strong>{uploadResult.saved}</strong> 个</p>
                    </Col>
                    <Col span={8}>
                      <p>过滤国内邮箱：<strong>{uploadResult.chinaEmails || 0}</strong> 个</p>
                    </Col>
                  </Row>
                </Card>
              )}
            </Form>

            {/* 文本输入区域 */}
            <Card title="邮箱文本输入" type="inner" size="small" style={{ marginTop: 16 }}>
              <Form.Item label="邮箱地址（一行一个或用逗号分隔）">
                <Input.TextArea
                  rows={8}
                  placeholder="请输入邮箱地址，一行一个或用逗号分隔"
                  value={emailsText}
                  onChange={(e) => setEmailsText(e.target.value)}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  loading={matching}
                  onClick={handleTextUpload}
                  icon={<CheckCircleOutlined />}
                >
                  匹配邮箱
                </Button>
              </Form.Item>
            </Card>

            {/* 匹配结果 */}
            {matchResult && (
              <Card title="匹配结果" type="inner" size="small" style={{ marginTop: 16 }}>
                <Row gutter={16}>
                  {/* 已存在邮箱 */}
                  <Col span={8}>
                    <Card title={`已存在邮箱 (${matchResult.matched.count})`} bordered={false}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Button
                          type="text"
                          icon={<CopyOutlined />}
                          onClick={() => {
                            const existingEmails = matchResult.matched.emails.map((e: any) => e.email).join('\n');
                            copyToClipboard(existingEmails);
                          }}
                          style={{ alignSelf: 'flex-end' }}
                        >
                          复制所有
                        </Button>
                        <div style={{ 
                          maxHeight: 300, 
                          overflowY: 'auto', 
                          border: '1px solid #f0f0f0', 
                          borderRadius: 4, 
                          padding: 12 
                        }}>
                          {matchResult.matched.emails.map((email: any, index: number) => (
                            <div key={index} style={{ marginBottom: 8, fontSize: 14 }}>
                              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                              {email.email}
                            </div>
                          ))}
                        </div>
                      </Space>
                    </Card>
                  </Col>
                  {/* 新增邮箱 */}
                  <Col span={8}>
                    <Card title={`新增邮箱 (${matchResult.unmatched.count})`} bordered={false}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Button
                          type="text"
                          icon={<CopyOutlined />}
                          onClick={() => {
                            const newEmails = matchResult.unmatched.emails.join('\n');
                            copyToClipboard(newEmails);
                          }}
                          style={{ alignSelf: 'flex-end' }}
                        >
                          复制所有
                        </Button>
                        <div style={{ 
                          maxHeight: 300, 
                          overflowY: 'auto', 
                          border: '1px solid #f0f0f0', 
                          borderRadius: 4, 
                          padding: 12 
                        }}>
                          {matchResult.unmatched.emails.map((email: string, index: number) => (
                            <div key={index} style={{ marginBottom: 8, fontSize: 14 }}>
                              <CloseCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                              {email}
                            </div>
                          ))}
                        </div>
                      </Space>
                    </Card>
                  </Col>
                  {/* 过滤国内邮箱 */}
                  <Col span={8}>
                    <Card title={`过滤国内邮箱 (${matchResult.chinaEmails.count})`} bordered={false}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Button
                          type="text"
                          icon={<CopyOutlined />}
                          onClick={() => {
                            const chinaEmails = matchResult.chinaEmails.emails.join('\n');
                            copyToClipboard(chinaEmails);
                          }}
                          style={{ alignSelf: 'flex-end' }}
                        >
                          复制所有
                        </Button>
                        <div style={{ 
                          maxHeight: 300, 
                          overflowY: 'auto', 
                          border: '1px solid #f0f0f0', 
                          borderRadius: 4, 
                          padding: 12 
                        }}>
                          {matchResult.chinaEmails.emails.map((email: string, index: number) => (
                            <div key={index} style={{ marginBottom: 8, fontSize: 14 }}>
                              <FilterOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                              {email}
                            </div>
                          ))}
                        </div>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </Card>
            )}
          </TabPane>

          {/* 邮箱查询标签页 */}
          <TabPane tab="邮箱查询" key="2">
            {/* 搜索条件 - 移动到内部Tabs上方 */}
            <Card type="inner" size="small" style={{ marginBottom: 16 }}>
              <Form
                form={searchForm}
                layout="inline"
                onFinish={() => {
                  // 根据当前选中的标签页决定查询条件
                  if (currentTab === 'all') {
                    handleSearch(undefined); // 查询所有邮箱
                  } else if (currentTab === 'notExported') {
                    handleSearch(false); // 查询未导出邮箱
                  } else if (currentTab === 'exported') {
                    handleSearch(true); // 查询已导出邮箱
                  }
                }}
              >
                <Form.Item name="industry" label="行业">
                  <Select
                    placeholder="请选择行业"
                  >
                    <Option value="全部">全部</Option>
                    <Option value="电子">电子</Option>
                    <Option value="机械">机械</Option>
                    <Option value="化工">化工</Option>
                    <Option value="纺织">纺织</Option>
                    <Option value="服装">服装</Option>
                    <Option value="食品">食品</Option>
                    <Option value="医药">医药</Option>
                    <Option value="能源">能源</Option>
                    <Option value="建筑">建筑</Option>
                    <Option value="餐饮">餐饮</Option>
                    <Option value="其他">其他</Option>
                  </Select>
                </Form.Item>

                <Form.Item label="日期范围">
                  <RangePicker
                    value={dateRange}
                    onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null])}
                    style={{ width: 300 }}
                    ranges={{
                      '今天': [dayjs(), dayjs()],
                      '昨天': [dayjs().subtract(1, 'day'), dayjs().subtract(1, 'day')],
                      '最近7天': [dayjs().subtract(6, 'day'), dayjs()],
                      '最近30天': [dayjs().subtract(29, 'day'), dayjs()],
                      '最近半年': [dayjs().subtract(6, 'month'), dayjs()],
                      '最近一年': [dayjs().subtract(1, 'year'), dayjs()],
                      '所有日期': [null, null]
                    }}
                  />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                      查询
                    </Button>
                    <Button icon={<ClearOutlined />} onClick={handleClearFilters}>
                      清除
                    </Button>
                    {selectedRows.length > 0 && (
                      <>
                        <Button type="primary" icon={<ExportOutlined />} onClick={handleExport}>
                          导出 ({selectedRows.length})
                        </Button>
                        <Button danger icon={<DeleteOutlined />} onClick={handleBatchDelete}>
                          批量删除 ({selectedRows.length})
                        </Button>
                      </>
                    )}
                  </Space>
                </Form.Item>
              </Form>
            </Card>

            <Tabs 
              defaultActiveKey="all"
              activeKey={currentTab}
              onChange={(key) => {
                // 切换标签时更新状态并重新查询
                setCurrentTab(key);
                if (key === 'all') {
                  handleSearch(undefined); // 查询所有邮箱
                } else if (key === 'notExported') {
                  handleSearch(false); // 查询未导出邮箱
                } else if (key === 'exported') {
                  handleSearch(true); // 查询已导出邮箱
                }
              }}
            >
              {/* 查询结果子标签 */}
              <TabPane tab="查询结果" key="all">
                {/* 邮箱列表 */}
                <Table
                  columns={columns}
                  dataSource={emails}
                  rowKey="_id"
                  loading={loading}
                  pagination={paginationConfig}
                  bordered
                  onChange={handleTableChange}
                  onRow={(record) => ({
                    onClick: () => {
                      const selected = selectedRows.find(row => row._id === record._id);
                      if (selected) {
                        setSelectedRows(selectedRows.filter(row => row._id !== record._id));
                      } else {
                        setSelectedRows([...selectedRows, record]);
                      }
                    }
                  })}
                />
              </TabPane>

              {/* 未导出子标签 */}
              <TabPane tab="未导出" key="notExported">
                {/* 邮箱列表 */}
                <Table
                  columns={columns}
                  dataSource={emails.filter(email => !email.exported)}
                  rowKey="_id"
                  loading={loading}
                  pagination={paginationConfig}
                  bordered
                  onChange={handleTableChange}
                  onRow={(record) => ({
                    onClick: () => {
                      const selected = selectedRows.find(row => row._id === record._id);
                      if (selected) {
                        setSelectedRows(selectedRows.filter(row => row._id !== record._id));
                      } else {
                        setSelectedRows([...selectedRows, record]);
                      }
                    }
                  })}
                />
              </TabPane>

              {/* 已导出子标签 */}
              <TabPane tab="已导出" key="exported">
                {/* 邮箱列表 */}
                <Table
                  columns={columns}
                  dataSource={emails.filter(email => email.exported)}
                  rowKey="_id"
                  loading={loading}
                  pagination={paginationConfig}
                  bordered
                  onChange={handleTableChange}
                  onRow={(record) => ({
                    onClick: () => {
                      const selected = selectedRows.find(row => row._id === record._id);
                      if (selected) {
                        setSelectedRows(selectedRows.filter(row => row._id !== record._id));
                      } else {
                        setSelectedRows([...selectedRows, record]);
                      }
                    }
                  })}
                />
              </TabPane>
            </Tabs>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default EmailManagement;