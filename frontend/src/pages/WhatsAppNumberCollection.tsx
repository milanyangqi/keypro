import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Input, 
  Button, 
  Select, 
  Space, 
  message, 
  Tabs, 
  Table, 
  Tag, 
  Progress, 
  Typography, 
  Row, 
  Col, 
  Checkbox, 
  Spin, 
  InputNumber,
  Modal
} from 'antd';
import { 
  SearchOutlined, 
  DownloadOutlined, 
  CopyOutlined, 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  StopOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { WhatsAppNumber } from '../types';
import { 
  getCollectionWebsites, 
  getCollectionRegions, 
  startCollection, 
  pauseCollection, 
  resumeCollection, 
  stopCollection, 
  getCollectionStatus, 
  getCollectionResults, 
  getCollectionLogs, 
  exportCollectionResults 
} from '../services/whatsapp';

const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Paragraph } = Typography;

// 采集任务状态类型
type TaskStatus = 'pending' | 'running' | 'paused' | 'completed' | 'stopped' | 'failed';

// 采集配置类型
interface CollectionConfig {
  regions: string[];
  keywords: string[];
  sources: string[];
  pages: number;
  delay?: number;
}

// 采集进度类型
interface CollectionProgress {
  currentPage: number;
  totalPages: number;
  collectedNumbers: number;
  processedSources: number;
  totalSources: number;
}

// 结果统计类型
interface ResultStats {
  success: number;
  failed: number;
  duplicate: number;
  total: number;
}

// 采集状态类型
interface CollectionStatus {
  taskId: string;
  status: TaskStatus;
  progress: CollectionProgress;
  stats: ResultStats;
  startedAt?: string;
  completedAt?: string;
}

const WhatsAppNumberCollection: React.FC = () => {
  // 初始化状态
  const [loading, setLoading] = useState(true);
  const [websites, setWebsites] = useState<Array<{ value: string; label: string; url: string }>>([]);
  const [regions, setRegions] = useState<Array<{ value: string; label: string; code: string }>>([]);
  
  // 采集配置
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['usa']);
  const [keywords, setKeywords] = useState('');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [pages, setPages] = useState<number>(10);
  const [delay, setDelay] = useState<number>(1000);
  
  // 采集任务状态
  const [collectionStatus, setCollectionStatus] = useState<CollectionStatus | null>(null);
  const [isCollecting, setIsCollecting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  // 采集结果
  const [collectionResults, setCollectionResults] = useState<WhatsAppNumber[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // 导出状态
  const [exportLoading, setExportLoading] = useState(false);
  
  // 日志模态框
  const [logsModalVisible, setLogsModalVisible] = useState(false);
  
  // 初始化数据
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [websitesData, regionsData] = await Promise.all([
          getCollectionWebsites(),
          getCollectionRegions()
        ]);
        setWebsites(websitesData.data.websites);
        setRegions(regionsData.data.regions);
        message.success('初始化数据加载成功');
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        message.error('初始化数据加载失败');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);
  
  // 定时更新采集状态
  useEffect(() => {
    let interval: number;
    if (collectionStatus && isCollecting && ['running', 'paused'].includes(collectionStatus.status)) {
      interval = setInterval(async () => {
        try {
          const statusData = await getCollectionStatus(collectionStatus.taskId);
          setCollectionStatus(statusData.data);
          
          // 如果任务已完成或停止，取消定时更新
          if (['completed', 'stopped', 'failed'].includes(statusData.data.status)) {
            setIsCollecting(false);
            message.success(`采集任务已${statusData.data.status}`);
          }
        } catch (error) {
          console.error('Failed to update collection status:', error);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [collectionStatus, isCollecting]);
  
  // 开始采集
  const handleStartCollection = async () => {
    try {
      // 验证输入
      if (!keywords.trim()) {
        message.error('请输入搜索关键词');
        return;
      }
      
      if (selectedSources.length === 0) {
        message.error('请选择至少一个采集来源');
        return;
      }
      
      setLoading(true);
      
      // 准备采集配置
      const config: CollectionConfig = {
        regions: selectedRegions,
        keywords: keywords.split('\n').filter(keyword => keyword.trim()),
        sources: selectedSources,
        pages,
        delay
      };
      
      // 调用开始采集API
      const response = await startCollection({
        config
      });
      
      const taskId = response.data.taskId;
      message.success('采集任务已启动');
      
      // 初始化采集状态
      setCollectionStatus({
        taskId,
        status: 'running',
        progress: {
          currentPage: 0,
          totalPages: pages,
          collectedNumbers: 0,
          processedSources: 0,
          totalSources: selectedSources.length
        },
        stats: {
          success: 0,
          failed: 0,
          duplicate: 0,
          total: 0
        },
        startedAt: new Date().toISOString()
      });
      
      setIsCollecting(true);
      setLogs([`采集任务已启动 - ${new Date().toISOString()}`]);
      
      // 清空之前的采集结果
      setCollectionResults([]);
      setTotalResults(0);
    } catch (error) {
      console.error('Failed to start collection:', error);
      message.error('采集任务启动失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 暂停采集
  const handlePauseCollection = async () => {
    if (!collectionStatus) return;
    
    try {
      await pauseCollection(collectionStatus.taskId);
      setCollectionStatus(prev => prev ? { ...prev, status: 'paused' } : null);
      message.success('采集任务已暂停');
      setLogs(prev => [...prev, `采集任务已暂停 - ${new Date().toISOString()}`]);
    } catch (error) {
      console.error('Failed to pause collection:', error);
      message.error('采集任务暂停失败');
    }
  };
  
  // 继续采集
  const handleResumeCollection = async () => {
    if (!collectionStatus) return;
    
    try {
      await resumeCollection(collectionStatus.taskId);
      setCollectionStatus(prev => prev ? { ...prev, status: 'running' } : null);
      message.success('采集任务已继续');
      setLogs(prev => [...prev, `采集任务已继续 - ${new Date().toISOString()}`]);
    } catch (error) {
      console.error('Failed to resume collection:', error);
      message.error('采集任务继续失败');
    }
  };
  
  // 停止采集
  const handleStopCollection = async () => {
    if (!collectionStatus) return;
    
    try {
      await stopCollection(collectionStatus.taskId);
      setCollectionStatus(prev => prev ? { ...prev, status: 'stopped' } : null);
      setIsCollecting(false);
      message.success('采集任务已停止');
      setLogs(prev => [...prev, `采集任务已停止 - ${new Date().toISOString()}`]);
    } catch (error) {
      console.error('Failed to stop collection:', error);
      message.error('采集任务停止失败');
    }
  };
  
  // 获取采集结果
  const fetchCollectionResults = async () => {
    if (!collectionStatus) return;
    
    try {
      setLoading(true);
      const response = await getCollectionResults(collectionStatus.taskId, {
        page: currentPage,
        limit: pageSize
      });
      setCollectionResults(response.data.numbers);
      setTotalResults(response.data.pagination.total);
      message.success(`获取到 ${response.data.numbers.length} 条采集结果`);
    } catch (error) {
      console.error('Failed to fetch collection results:', error);
      message.error('获取采集结果失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 获取采集日志
  const fetchCollectionLogs = async () => {
    if (!collectionStatus) return;
    
    try {
      setLoading(true);
      const response = await getCollectionLogs(collectionStatus.taskId);
      setLogs(response.data.logs);
      message.success('获取采集日志成功');
      setLogsModalVisible(true);
    } catch (error) {
      console.error('Failed to fetch collection logs:', error);
      message.error('获取采集日志失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 导出采集结果
  const handleExportResults = async (format: 'excel' | 'csv') => {
    if (!collectionStatus) return;
    
    try {
      setExportLoading(true);
      const response = await exportCollectionResults(collectionStatus.taskId, format);
      
      // 创建下载链接
      const link = document.createElement('a');
      link.href = response.data.fileUrl;
      link.download = response.data.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success(`导出${format === 'excel' ? 'Excel' : 'CSV'}文件成功`);
    } catch (error) {
      console.error('Failed to export collection results:', error);
      message.error('导出采集结果失败');
    } finally {
      setExportLoading(false);
    }
  };
  
  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('已复制到剪贴板');
    }).catch(() => {
      message.error('复制失败');
    });
  };
  
  // 复制单个号码
  const copyNumber = (number: string) => {
    copyToClipboard(number);
  };
  
  // 复制所有号码
  const copyAllNumbers = () => {
    const allNumbers = collectionResults.map(item => item.number).join('\n');
    copyToClipboard(allNumbers);
  };
  
  // 表格列配置
  const columns = [
    {
      title: 'WhatsApp号码',
      dataIndex: 'number',
      key: 'number',
      render: (number: string) => <strong>{number}</strong>,
      ellipsis: true
    },
    {
      title: '所属行业',
      dataIndex: 'industry',
      key: 'industry',
      render: (industry: string) => <Tag color="blue">{industry}</Tag>,
      ellipsis: true
    },
    {
      title: '关键词',
      dataIndex: 'keyword',
      key: 'keyword',
      ellipsis: true
    },
    {
      title: '来源平台',
      dataIndex: 'platform',
      key: 'platform',
      ellipsis: true
    },
    {
      title: '上传时间',
      dataIndex: 'uploadTime',
      key: 'uploadTime',
      render: (time: string) => new Date(time).toLocaleString(),
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: WhatsAppNumber) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<CopyOutlined />} 
            onClick={() => copyNumber(record.number)}
          >
            复制
          </Button>
        </Space>
      ),
    },
  ];
  
  // 获取状态图标
  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'running':
        return <LoadingOutlined style={{ color: '#1890ff' }} />;
      case 'paused':
        return <PauseCircleOutlined style={{ color: '#faad14' }} />;
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'stopped':
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'pending':
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };
  
  // 获取状态文本
  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case 'running':
        return '运行中';
      case 'paused':
        return '已暂停';
      case 'completed':
        return '已完成';
      case 'stopped':
        return '已停止';
      case 'failed':
        return '失败';
      case 'pending':
      default:
        return '待处理';
    }
  };
  
  // 获取状态颜色
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'running':
        return '#1890ff';
      case 'paused':
        return '#faad14';
      case 'completed':
        return '#52c41a';
      case 'stopped':
      case 'failed':
        return '#ff4d4f';
      case 'pending':
      default:
        return '#1890ff';
    }
  };
  
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f2f5', 
      minHeight: '100vh'
    }}>
      <Title level={2} style={{ 
        marginBottom: '20px', 
        textAlign: 'center', 
        color: '#1f2937' 
      }}>WhatsApp号码采集器</Title>
      
      <Spin spinning={loading} tip="加载中...">
        <Tabs 
          defaultActiveKey="1" 
          style={{ maxWidth: 1200, margin: '0 auto' }}
          tabBarStyle={{ marginBottom: '20px' }}
        >
          {/* 号码采集标签页 */}
          <TabPane tab="号码采集" key="1">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* 采集配置卡片 */}
              <Card 
                style={{ 
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  borderRadius: '8px'
                }}
                title={<span style={{ fontSize: '16px', fontWeight: 'bold' }}>采集配置</span>}
              >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  {/* 地区选择 */}
                  <div>
                    <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>目标地区</div>
                    <Select
                      mode="multiple"
                      placeholder="选择目标地区"
                      value={selectedRegions}
                      onChange={setSelectedRegions}
                      style={{ width: '100%' }}
                      maxTagCount={3}
                    >
                      {regions.map(region => (
                        <Option key={region.value} value={region.value}>
                          {region.label} ({region.code})
                        </Option>
                      ))}
                    </Select>
                  </div>

                  {/* 关键词输入 */}
                  <div>
                    <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>搜索关键词</div>
                    <Input.TextArea
                      placeholder="输入搜索关键词，每行一个"
                      value={keywords}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setKeywords(e.target.value)}
                      rows={4}
                      style={{ width: '100%' }}
                    />
                  </div>

                  {/* 采集来源选择 */}
                  <div>
                    <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>采集来源</div>
                    <Checkbox.Group 
                      options={websites.map(website => ({
                        label: website.label,
                        value: website.value
                      }))}
                      value={selectedSources}
                      onChange={setSelectedSources}
                      style={{ width: '100%' }}
                    />
                  </div>

                  {/* 采集配置 */}
                  <Row gutter={16}>
                    <Col span={12}>
                      <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>采集页数</div>
                      <InputNumber
                        min={1}
                        max={100}
                        value={pages}
                        onChange={(value) => value !== null && setPages(value)}
                        style={{ width: '100%' }}
                        placeholder="输入采集页数"
                      />
                    </Col>
                    <Col span={12}>
                      <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>延迟时间(ms)</div>
                      <InputNumber
                        min={500}
                        max={10000}
                        step={500}
                        value={delay}
                        onChange={(value) => value !== null && setDelay(value)}
                        style={{ width: '100%' }}
                        placeholder="输入延迟时间"
                      />
                    </Col>
                  </Row>

                  {/* 开始采集按钮 */}
                  <Button 
                    type="primary" 
                    onClick={handleStartCollection} 
                    style={{ 
                      width: '100%', 
                      height: '48px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      backgroundColor: '#52c41a',
                      borderColor: '#52c41a',
                      borderRadius: '4px'
                    }}
                    icon={<SearchOutlined />}
                    disabled={isCollecting}
                  >
                    开始采集
                  </Button>
                </Space>
              </Card>

              {/* 采集状态和控制 */}
              {collectionStatus && (
                <Card 
                  style={{ 
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    borderRadius: '8px'
                  }}
                  title={<span style={{ fontSize: '16px', fontWeight: 'bold' }}>采集状态</span>}
                >
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {/* 基本状态信息 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Space>
                        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>任务状态:</span>
                        <Tag 
                          color={getStatusColor(collectionStatus.status)} 
                          icon={getStatusIcon(collectionStatus.status)}
                        >
                          {getStatusText(collectionStatus.status)}
                        </Tag>
                      </Space>
                      <Space>
                        <Button 
                          type="primary"
                          icon={<PlayCircleOutlined />}
                          onClick={handleResumeCollection}
                          disabled={collectionStatus.status !== 'paused'}
                        >
                          继续
                        </Button>
                        <Button 
                          icon={<PauseCircleOutlined />}
                          onClick={handlePauseCollection}
                          disabled={collectionStatus.status !== 'running'}
                        >
                          暂停
                        </Button>
                        <Button 
                          danger
                          icon={<StopOutlined />}
                          onClick={handleStopCollection}
                          disabled={['completed', 'stopped', 'failed'].includes(collectionStatus.status)}
                        >
                          停止
                        </Button>
                      </Space>
                    </div>
                    
                    {/* 采集进度 */}
                    <div>
                      <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>采集进度</div>
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span>总进度</span>
                          <span>{Math.round((collectionStatus.progress.currentPage / collectionStatus.progress.totalPages) * 100)}%</span>
                        </div>
                        <Progress 
                          percent={Math.round((collectionStatus.progress.currentPage / collectionStatus.progress.totalPages) * 100)} 
                          status="active" 
                        />
                      </div>
                      
                      <Row gutter={16}>
                        <Col span={12}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span>已采集号码</span>
                            <span>{collectionStatus.progress.collectedNumbers}</span>
                          </div>
                          <Progress 
                            percent={Math.round((collectionStatus.progress.collectedNumbers / (collectionStatus.progress.totalPages * 20)) * 100)} 
                            status="active" 
                            strokeColor="#52c41a"
                          />
                        </Col>
                        <Col span={12}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span>已处理来源</span>
                            <span>{collectionStatus.progress.processedSources}/{collectionStatus.progress.totalSources}</span>
                          </div>
                          <Progress 
                            percent={Math.round((collectionStatus.progress.processedSources / collectionStatus.progress.totalSources) * 100)} 
                            status="active" 
                            strokeColor="#1890ff"
                          />
                        </Col>
                      </Row>
                    </div>
                    
                    {/* 结果统计 */}
                    <div>
                      <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>结果统计</div>
                      <Row gutter={16}>
                        <Col span={6}>
                          <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '4px' }}>
                            <div style={{ fontSize: '12px', color: '#52c41a', marginBottom: '4px' }}>成功</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#389e0d' }}>{collectionStatus.stats.success}</div>
                          </div>
                        </Col>
                        <Col span={6}>
                          <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#fff1f0', border: '1px solid #ffccc7', borderRadius: '4px' }}>
                            <div style={{ fontSize: '12px', color: '#ff4d4f', marginBottom: '4px' }}>失败</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#cf1322' }}>{collectionStatus.stats.failed}</div>
                          </div>
                        </Col>
                        <Col span={6}>
                          <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f0f5ff', border: '1px solid #adc6ff', borderRadius: '4px' }}>
                            <div style={{ fontSize: '12px', color: '#1890ff', marginBottom: '4px' }}>重复</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>{collectionStatus.stats.duplicate}</div>
                          </div>
                        </Col>
                        <Col span={6}>
                          <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '4px' }}>
                            <div style={{ fontSize: '12px', color: '#faad14', marginBottom: '4px' }}>总计</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#d48806' }}>{collectionStatus.stats.total}</div>
                          </div>
                        </Col>
                      </Row>
                    </div>
                    
                    {/* 操作按钮 */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Space>
                        <Button onClick={fetchCollectionLogs}>
                          查看日志
                        </Button>
                        <Button 
                          type="primary"
                          onClick={fetchCollectionResults}
                        >
                          查看结果
                        </Button>
                      </Space>
                    </div>
                  </Space>
                </Card>
              )}

              {/* 采集结果 */}
              {collectionResults.length > 0 && (
                <Card 
                  style={{ 
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    borderRadius: '8px'
                  }}
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '16px', fontWeight: 'bold' }}>采集结果</span>
                      <Space>
                        <Button 
                          icon={<CopyOutlined />}
                          onClick={copyAllNumbers}
                        >
                          复制全部号码
                        </Button>
                        <Button 
                          icon={<DownloadOutlined />}
                          onClick={() => handleExportResults('excel')}
                          loading={exportLoading}
                        >
                          导出Excel
                        </Button>
                        <Button 
                          icon={<DownloadOutlined />}
                          onClick={() => handleExportResults('csv')}
                          loading={exportLoading}
                        >
                          导出CSV
                        </Button>
                      </Space>
                    </div>
                  }
                >
                  <Table
                    columns={columns}
                    dataSource={collectionResults}
                    rowKey="_id"
                    pagination={{
                      current: currentPage,
                      pageSize: pageSize,
                      total: totalResults,
                      onChange: (page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                        fetchCollectionResults();
                      },
                      showSizeChanger: true,
                      pageSizeOptions: ['10', '20', '50', '100'],
                      showTotal: (total) => `共 ${total} 条记录`
                    }}
                    scroll={{ x: 800 }}
                  />
                </Card>
              )}
            </Space>
          </TabPane>
          
          {/* 使用说明标签页 */}
          <TabPane tab="使用说明" key="2">
            <Card 
              style={{ 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                borderRadius: '8px'
              }}
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Title level={3}>功能介绍</Title>
                <Paragraph>
                  WhatsApp号码采集器是一个用于自动从指定网站采集WhatsApp号码的工具。
                  您可以通过设置目标地区、搜索关键词和采集来源，实现自动化的号码采集。
                </Paragraph>
                
                <Title level={3}>使用步骤</Title>
                <div style={{ paddingLeft: '20px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>1. 配置采集参数</div>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      <li>选择目标地区：可选择多个国家或地区</li>
                      <li>输入搜索关键词：每行输入一个关键词，支持多个关键词</li>
                      <li>选择采集来源：可选择多个搜索引擎作为采集来源</li>
                      <li>设置采集页数：控制采集的深度，建议设置为10-50页</li>
                      <li>设置延迟时间：避免对目标网站造成过大压力，建议设置为1000-3000ms</li>
                    </ul>
                  </div>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>2. 开始采集</div>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      <li>点击"开始采集"按钮启动采集任务</li>
                      <li>在采集过程中可以查看实时进度和状态</li>
                      <li>可以随时暂停、继续或停止采集任务</li>
                    </ul>
                  </div>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>3. 查看和导出结果</div>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      <li>采集完成后，可以在"采集结果"中查看所有采集到的号码</li>
                      <li>支持复制单个号码或全部号码到剪贴板</li>
                      <li>支持导出为Excel或CSV格式</li>
                    </ul>
                  </div>
                </div>
                
                <Title level={3}>注意事项</Title>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>请遵守目标网站的 robots.txt 规则，合理设置采集间隔</li>
                  <li>不要过度采集同一网站，以免被封IP</li>
                  <li>采集到的号码仅供合法用途，请勿用于 spam 等非法活动</li>
                  <li>建议定期清理采集结果，只保留有用的号码</li>
                </ul>
                
                <Title level={3}>常见问题</Title>
                <div style={{ paddingLeft: '20px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Q: 采集任务为什么会失败？</div>
                    <div>A: 可能的原因包括网络问题、目标网站反爬机制、采集参数设置不合理等。建议检查网络连接，调整采集延迟，或减少采集页数。</div>
                  </div>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Q: 如何提高采集效率？</div>
                    <div>A: 可以适当调整采集延迟，增加采集页数，或选择更多的采集来源。但请注意不要过度采集，以免被封IP。</div>
                  </div>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Q: 采集到的号码有重复怎么办？</div>
                    <div>A: 系统会自动去重，重复的号码会被标记为"重复"，不会重复保存。</div>
                  </div>
                </div>
              </Space>
            </Card>
          </TabPane>
        </Tabs>
      </Spin>
      
      {/* 日志模态框 */}
      <Modal
        title="采集日志"
        open={logsModalVisible}
        onCancel={() => setLogsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setLogsModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
        destroyOnClose
      >
        <div style={{ maxHeight: '500px', overflowY: 'auto', padding: '10px', backgroundColor: '#fafafa', borderRadius: '4px' }}>
          {logs.map((log, index) => (
            <div key={index} style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
              {log}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default WhatsAppNumberCollection;
