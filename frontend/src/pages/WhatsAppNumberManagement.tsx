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
  Space
} from 'antd';
import { 
  UploadOutlined, 
  SearchOutlined,
  CopyOutlined,
  PlusOutlined,
  DeleteOutlined,
  ExportOutlined
} from '@ant-design/icons';
import { uploadNumbers, matchNumbers, getNumbers, deleteNumber, deleteNumbers, exportNumbers } from '../services/whatsapp';
import { WhatsAppNumber, WhatsAppMatchResult } from '../types';
import dayjs, { Dayjs } from 'dayjs';

const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

// 行业选项
const industryOptions = [
  '电子', '服装', '机械', '化工', '食品', '医药', '汽车', '能源',
  '建筑', '金融', 'IT', '物流', '教育', '旅游', '餐饮', '其他'
];

// 平台选项
const platformOptions = [
  'Google', 'Bing', 'Yahoo', 'Facebook', 'LinkedIn', 'TikTok', 'Instagram',
  'Twitter', 'Pinterest', 'YouTube', 'Reddit', 'Quora', 'Amazon', 'AliExpress', '其他'
];

const WhatsAppNumberManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [numbersText, setNumbersText] = useState<string>('');
  const [matchResult, setMatchResult] = useState<WhatsAppMatchResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [queryLoading, setQueryLoading] = useState<boolean>(false);
  const [numbers, setNumbers] = useState<WhatsAppNumber[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(500);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  // 默认显示所有数据，不限制日期范围
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  // 自定义平台输入状态
  const [showCustomPlatform, setShowCustomPlatform] = useState(false);
  const [customPlatform, setCustomPlatform] = useState('');
  // 表格筛选状态
  const [filteredInfo, setFilteredInfo] = useState<{
    [key: string]: any;
  }>({});
  // 用于区分未导出和已导出的选中行
  const [selectedUnexportedRowKeys, setSelectedUnexportedRowKeys] = useState<React.Key[]>([]);
  const [selectedExportedRowKeys, setSelectedExportedRowKeys] = useState<React.Key[]>([]);
  
  // 处理表格筛选和排序
  const handleTableChange = (_pagination: any, filters: any, _sorter: any) => {
    setFilteredInfo(filters);
  };

  // 初始化表单默认值
  useEffect(() => {
    form.setFieldsValue({
      industry: '餐饮'
    });
  }, [form]);

  // 处理单个删除
  const handleDelete = async (id: string) => {
    try {
      // 立即从UI中删除，提供更好的用户体验
      setNumbers(prevNumbers => prevNumbers.filter(number => number._id !== id));
      
      await deleteNumber(id);
      message.success('删除成功！');
      handleQuery();
    } catch (error: any) {
      message.error(error.message || '删除失败！');
      // 删除失败时重新查询数据，恢复正确状态
      handleQuery();
    }
  };

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的号码！');
      return;
    }
    
    try {
      // 立即从UI中删除，提供更好的用户体验
      setNumbers(prevNumbers => prevNumbers.filter(number => !selectedRowKeys.includes(number._id)));
      
      const response = await deleteNumbers(selectedRowKeys as string[]);
      message.success(`成功删除 ${response.deletedCount} 个号码！`);
      setSelectedRowKeys([]);
      handleQuery();
    } catch (error: any) {
      message.error(error.message || '批量删除失败！');
      // 删除失败时重新查询数据，恢复正确状态
      handleQuery();
      setSelectedRowKeys([]);
    }
  };

  // 复制号码到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => message.success('复制成功！'))
      .catch(() => message.error('复制失败！'));
  };

  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    setLoading(true);
    try {
      const selectedIndustry = form.getFieldValue('industry');
      const keyword = form.getFieldValue('keyword');
      const syntax = form.getFieldValue('syntax');
      const platform = form.getFieldValue('platform');
      
      if (!selectedIndustry) {
        message.error('请选择或输入行业！');
        return false;
      }
      
      // 上传文件
      const response = await uploadNumbers(file, selectedIndustry, keyword, syntax, platform);
      if (response.status === 'success') {
        // 直接使用上传返回的匹配结果
        const matchRes = {
          matched: {
            count: response.data.matched,
            numbers: response.data.matchedNumbers
          },
          unmatched: {
            count: response.data.saved,
            numbers: response.data.savedNumbers.map((num: any) => num.number)
          }
        };
        
        // 显示匹配结果
        setMatchResult(matchRes);
        
        message.success(`上传完成，已有 ${matchRes.matched.count} 个号码，新增 ${matchRes.unmatched.count} 个号码`);
        
        // 清空表单
        form.resetFields();
        setNumbersText('');
        
        // 重新查询数据
        handleQuery();
      }
    } catch (error: any) {
      message.error(error.message || '上传失败！');
    } finally {
      setLoading(false);
    }
    return false; // 阻止自动上传
  };

  // 处理文本区域号码上传
  const handleTextUpload = async () => {
    setLoading(true);
    try {
      const selectedIndustry = form.getFieldValue('industry');
      const keyword = form.getFieldValue('keyword');
      const syntax = form.getFieldValue('syntax');
      const platform = form.getFieldValue('platform');
      
      if (!selectedIndustry) {
        message.error('请选择或输入行业！');
        return;
      }
      
      if (!numbersText.trim()) {
        message.error('请输入号码！');
        return;
      }
      
      // 将文本转换为数组
      const numbersArray = numbersText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      if (numbersArray.length === 0) {
        message.error('请输入有效的号码！');
        return;
      }
      
      // 先匹配号码
      const matchRes = await matchNumbers(numbersArray);
      
      // 如果有新号码，需要创建临时文件并上传
      if (matchRes.unmatched.count > 0) {
        // 创建临时文件
        const tempText = matchRes.unmatched.numbers.join('\n');
        const tempFile = new Blob([tempText], { type: 'text/plain' });
        const file = new File([tempFile], 'temp-numbers.txt', { type: 'text/plain' });
        
        // 上传新号码，传递所有字段
        await uploadNumbers(file, selectedIndustry, keyword, syntax, platform);
      }
      
      setMatchResult(matchRes);
      
      message.success(`匹配完成，已有 ${matchRes.matched.count} 个号码，新增 ${matchRes.unmatched.count} 个号码`);
      
      // 重新查询数据
      handleQuery();
    } catch (error: any) {
      message.error(error.message || '处理失败！');
    } finally {
      setLoading(false);
    }
  };

  // 查询号码
  const handleQuery = async (exported?: boolean) => {
    setQueryLoading(true);
    try {
      const selectedIndustry = form.getFieldValue('industry');
      const params: any = {
        page: currentPage,
        limit: pageSize
      };
      
      // 只有当exported参数被明确传递时才添加到查询条件中
      if (exported !== undefined) {
        params.exported = exported;
      }
      
      if (selectedIndustry && selectedIndustry !== '全部') {
        params.industry = selectedIndustry;
      }
      
      if (dateRange[0]) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
      }
      
      if (dateRange[1]) {
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      
      const response = await getNumbers(params);
      // 直接使用response，因为getNumbers已经返回response.data
      setNumbers(response.numbers);
      setTotal(response.pagination.total);
    } catch (error: any) {
      message.error(error.message || '查询失败！');
    } finally {
      setQueryLoading(false);
    }
  };

  // 导出号码
  const handleExport = async () => {
    try {
      // 获取当前选中的未导出号码
      const selectedIds = selectedUnexportedRowKeys;
      if (selectedIds.length === 0) {
        message.warning('请先选择要导出的号码！');
        return;
      }
      
      setQueryLoading(true);
      // 调用导出接口
      const data = await exportNumbers(selectedIds as string[]);
      
      // 提取号码
      const numbers = data.exportedNumbers.map((item: any) => item.number);
      const numbersText = numbers.join('\n');
      
      // 复制到剪贴板
      try {
        await navigator.clipboard.writeText(numbersText);
      } catch (clipboardError) {
        console.warn('剪贴板复制失败，将仅提供文件下载：', clipboardError);
      }
      
      // 创建并下载文本文件
      const blob = new Blob([numbersText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `whatsapp-numbers-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      message.success(`导出成功！${numbers.length}个号码已复制到剪贴板并下载为文件！`);
      
      // 重新查询数据，更新显示
      handleQuery(false);
    } catch (error: any) {
      message.error(error.message || '导出失败！');
    } finally {
      setQueryLoading(false);
    }
  };

  // 国家代码到国家名称的映射
  const countryCodeToName = (number: string): string => {
    // 定义国家代码映射，只保留最长的国家代码，避免匹配冲突
    // 例如，+44 是英国，我们不需要再保留 +4 作为其他国家的代码
    const countryCodes: Record<string, string> = {
      // 4位国家代码
      '+1649': '特克斯和凯科斯群岛',
      '+1664': '蒙特塞拉特',
      '+1670': '北马里亚纳群岛',
      '+1671': '关岛',
      '+1721': '圣马丁',
      '+1758': '圣卢西亚',
      '+1767': '多米尼克',
      '+1784': '圣文森特和格林纳丁斯',
      '+1787': '波多黎各',
      '+1808': '夏威夷',
      '+1809': '多米尼加共和国',
      '+1829': '多米尼加共和国',
      '+1849': '多米尼加共和国',
      '+1864': '美属维尔京群岛',
      '+1868': '特立尼达和多巴哥',
      '+1869': '圣基茨和尼维斯',
      '+1876': '牙买加',
      
      // 3位国家代码
      '+20': '埃及',
      '+213': '阿尔及利亚',
      '+221': '塞内加尔',
      '+234': '尼日利亚',
      '+254': '肯尼亚',
      '+264': '纳米比亚',
      '+27': '南非',
      '+30': '希腊',
      '+31': '荷兰',
      '+33': '法国',
      '+34': '西班牙',
      '+39': '意大利',
      '+41': '瑞士',
      '+44': '英国',
      '+46': '瑞典',
      '+47': '挪威',
      '+49': '德国',
      '+51': '秘鲁',
      '+52': '墨西哥',
      '+55': '巴西',
      '+60': '马来西亚',
      '+61': '澳大利亚',
      '+62': '印度尼西亚',
      '+64': '新西兰',
      '+65': '新加坡',
      '+66': '泰国',
      '+670': '东帝汶',
      '+671': '关岛',
      '+672': '澳大利亚海外领地',
      '+673': '文莱',
      '+674': '瑙鲁',
      '+675': '巴布亚新几内亚',
      '+676': '汤加',
      '+677': '所罗门群岛',
      '+678': '瓦努阿图',
      '+679': '斐济',
      '+680': '帕劳',
      '+682': '库克群岛',
      '+683': '纽埃',
      '+685': '萨摩亚',
      '+686': '基里巴斯',
      '+687': '新喀里多尼亚',
      '+688': '图瓦卢',
      '+689': '法属波利尼西亚',
      '+690': '托克劳',
      '+691': '密克罗尼西亚联邦',
      '+692': '马绍尔群岛',
      '+81': '日本',
      '+82': '韩国',
      '+84': '越南',
      '+852': '香港',
      '+853': '澳门',
      '+855': '柬埔寨',
      '+856': '老挝',
      '+86': '中国',
      '+886': '台湾',
      '+90': '土耳其',
      '+91': '印度',
      '+92': '巴基斯坦',
      '+94': '斯里兰卡',
      '+966': '沙特阿拉伯',
      '+971': '阿联酋',
      '+972': '以色列',
      
      // 2位国家代码 - 仅保留没有更长匹配的代码
      '+1': '美国/加拿大',
      '+7': '俄罗斯'
    };

    // 确保号码以+开头
    const normalizedNumber = number.startsWith('+') ? number : `+${number}`;
    
    // 寻找最长匹配的国家代码
    // 首先检查4位国家代码
    for (const code in countryCodes) {
      if (normalizedNumber.startsWith(code)) {
        return countryCodes[code];
      }
    }
    
    return '未知国家';
  };

  // 表格列配置
  const columns = [
    {
      title: '序号',
      key: 'index',
      width: 80,
      render: (_: any, __: WhatsAppNumber, index: number) => {
        return (currentPage - 1) * pageSize + index + 1;
      }
    },
    {
      title: '号码',
      dataIndex: 'number',
      key: 'number',
      width: 200
    },
    {
      title: '国家',
      key: 'country',
      width: 150,
      render: (_: any, record: WhatsAppNumber) => {
        return countryCodeToName(record.number);
      },
      // 动态生成国家筛选选项
      filters: Array.from(new Set(numbers.map(number => countryCodeToName(number.number)))).map(country => ({
        text: country as string,
        value: country as string
      })),
      filteredValue: filteredInfo.country || null,
      onFilter: (value: any, record: WhatsAppNumber) => countryCodeToName(record.number) === value
    },
    {
      title: '行业',
      dataIndex: 'industry',
      key: 'industry',
      width: 150,
      filters: [
        { text: '全部', value: '全部' },
        { text: '电子', value: '电子' },
        { text: '服装', value: '服装' },
        { text: '机械', value: '机械' },
        { text: '化工', value: '化工' },
        { text: '食品', value: '食品' },
        { text: '医药', value: '医药' },
        { text: '汽车', value: '汽车' },
        { text: '能源', value: '能源' },
        { text: '建筑', value: '建筑' },
        { text: '金融', value: '金融' },
        { text: 'IT', value: 'IT' },
        { text: '物流', value: '物流' },
        { text: '教育', value: '教育' },
        { text: '旅游', value: '旅游' },
        { text: '餐饮', value: '餐饮' },
        { text: '其他', value: '其他' }
      ],
      filteredValue: filteredInfo.industry || null,
      onFilter: (value: any, record: WhatsAppNumber) => {
        if (value === '全部') return true;
        return record.industry === value;
      }
    },
    {
      title: '关键词',
      dataIndex: 'keyword',
      key: 'keyword',
      width: 150,
      // 动态生成关键词筛选选项
      filters: Array.from(new Set(numbers.map(number => number.keyword).filter(Boolean))).map(keyword => ({
        text: keyword as string,
        value: keyword as string
      })),
      filteredValue: filteredInfo.keyword || null,
      onFilter: (value: any, record: WhatsAppNumber) => record.keyword === value
    },
    {
      title: '语法',
      dataIndex: 'syntax',
      key: 'syntax',
      width: 150,
      // 动态生成语法筛选选项
      filters: Array.from(new Set(numbers.map(number => number.syntax).filter(Boolean))).map(syntax => ({
        text: syntax as string,
        value: syntax as string
      })),
      filteredValue: filteredInfo.syntax || null,
      onFilter: (value: any, record: WhatsAppNumber) => record.syntax === value
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 150,
      // 动态生成平台筛选选项
      filters: Array.from(new Set(numbers.map(number => number.platform).filter(Boolean))).map(platform => ({
        text: platform as string,
        value: platform as string
      })),
      filteredValue: filteredInfo.platform || null,
      onFilter: (value: any, record: WhatsAppNumber) => record.platform === value
    },
    {
      title: '上传时间',
      dataIndex: 'uploadTime',
      key: 'uploadTime',
      width: 200,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '上传者',
      dataIndex: 'uploader',
      key: 'uploader',
      width: 150,
      render: (uploader: any) => uploader?.username || uploader,
      // 动态生成上传者筛选选项
      filters: Array.from(new Set(numbers.map(number => {
        const uploaderName = typeof number.uploader === 'string' ? number.uploader : number.uploader?.username;
        return uploaderName || '';
      }).filter(Boolean))).map(uploader => ({
        text: uploader as string,
        value: uploader as string
      })),
      filteredValue: filteredInfo.uploader || null,
      onFilter: (value: any, record: WhatsAppNumber) => {
        const uploaderName = typeof record.uploader === 'string' ? record.uploader : record.uploader?.username;
        return uploaderName === value;
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: WhatsAppNumber) => (
        <Space>
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

  // 表格行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  // 添加状态跟踪当前激活的嵌套标签页
  const [activeNestedTab, setActiveNestedTab] = useState('all');

  return (
    <div>
      <h1 style={{ marginBottom: 24, fontSize: 24, fontWeight: 600 }}>WhatsApp号码管理</h1>
      
      <Tabs defaultActiveKey="1" size="large">
        <TabPane tab="号码上传" key="1">
          <Card>
            <Form form={form} layout="vertical">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Form.Item
                    label="行业"
                    name="industry"
                    rules={[{ required: true, message: '请选择或输入行业！' }]}
                  >
                    <Select
                      placeholder="请选择行业"
                      showSearch
                      filterOption={(input, option) => {
                        // 使用any类型断言来解决TypeScript错误
                        return ((option as any)?.children || '').toLowerCase().includes(input.toLowerCase());
                      }}
                    >
                      {industryOptions.map(ind => (
                        <Option key={ind} value={ind}>{ind}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col span={24}>
                  <Form.Item label="关键词" name="keyword">
                    <Input placeholder="请输入关键词（非必填）" />
                  </Form.Item>
                </Col>
                
                <Col span={24}>
                  <Form.Item label="语法" name="syntax">
                    <Input placeholder="请输入语法（非必填）" />
                  </Form.Item>
                </Col>
                
                <Col span={24}>
                  <Form.Item label="平台" name="platform">
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
                
                <Col span={24}>
                  <Form.Item label="号码输入（一行一个）">
                    <TextArea
                      rows={6}
                      placeholder="请输入WhatsApp号码，一行一个"
                      value={numbersText}
                      onChange={(e) => setNumbersText(e.target.value)}
                    />
                  </Form.Item>
                </Col>
                
                <Col span={24}>
                  <Form.Item label="或上传文件">
                    <Space>
                      <Upload
                        beforeUpload={handleFileUpload}
                        showUploadList={false}
                      >
                        <Button icon={<UploadOutlined />} loading={loading}>
                          上传文件
                        </Button>
                      </Upload>
                    </Space>
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleTextUpload}
                    loading={loading}
                  >
                    上传号码
                  </Button>
                  <Button
                    onClick={() => {
                      form.resetFields();
                      setNumbersText('');
                    }}
                  >
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
          
          {/* 匹配结果展示 */}
          {matchResult && (
            <Card title="匹配结果" style={{ marginTop: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card title={`已存在号码 (${matchResult.matched.count})`} bordered={false}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Button
                        type="text"
                        icon={<CopyOutlined />}
                        onClick={() => {
                          const existingNumbers = matchResult.matched.numbers.map(n => n.number).join('\n');
                          copyToClipboard(existingNumbers);
                        }}
                        style={{ alignSelf: 'flex-end' }}
                      >
                        复制所有号码
                      </Button>
                      <div style={{ 
                        maxHeight: 300, 
                        overflowY: 'auto', 
                        border: '1px solid #f0f0f0', 
                        borderRadius: 4, 
                        padding: 12 
                      }}>
                        {matchResult.matched.numbers.map((n, index) => (
                          <div key={index} style={{ marginBottom: 8, fontSize: 14 }}>
                            <span style={{ marginRight: 12, color: '#999', fontSize: 12 }}>{index + 1}.</span>
                            <span style={{ marginRight: 12 }}>{n.number}</span>
                            <span style={{ color: '#999', fontSize: 12 }}>
                              {dayjs(n.uploadTime).format('YYYY-MM-DD')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Space>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title={`新号码 (${matchResult.unmatched.count})`} bordered={false}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Button
                        type="text"
                        icon={<CopyOutlined />}
                        onClick={() => {
                          const newNumbers = matchResult.unmatched.numbers.join('\n');
                          copyToClipboard(newNumbers);
                        }}
                        style={{ alignSelf: 'flex-end' }}
                      >
                        复制所有号码
                      </Button>
                      <div style={{ 
                        maxHeight: 300, 
                        overflowY: 'auto', 
                        border: '1px solid #f0f0f0', 
                        borderRadius: 4, 
                        padding: 12 
                      }}>
                        {matchResult.unmatched.numbers.map((n, index) => (
                          <div key={index} style={{ marginBottom: 8, fontSize: 14 }}>
                            <span style={{ marginRight: 12, color: '#999', fontSize: 12 }}>{index + 1}.</span>
                            {n}
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
        
        <TabPane tab="号码查询" key="2">
          <Card>
            {/* 查询条件表单，放在嵌套标签页外部，所有标签页共享 */}
            <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
              <Form.Item label="行业" name="industry">
                <Select
                  placeholder="请选择行业"
                  style={{ width: 150 }}
                >
                  <Option key="全部" value="全部">全部</Option>
                  {industryOptions.map(ind => (
                    <Option key={ind} value={ind}>{ind}</Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item label="日期范围">
                <RangePicker
                      value={dateRange}
                      onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
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
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={() => {
                    if (activeNestedTab === 'all') {
                      handleQuery(); // 查询所有号码
                    } else if (activeNestedTab === 'unexported') {
                      handleQuery(false); // 查询未导出号码
                    } else if (activeNestedTab === 'exported') {
                      handleQuery(true); // 查询已导出号码
                    }
                  }}
                  loading={queryLoading}
                >
                  搜索
                </Button>
                <Button
                  style={{ marginLeft: 8 }}
                  onClick={() => {
                    form.resetFields();
                    setDateRange([null, null]);
                  }}
                >
                  重置
                </Button>
              </Form.Item>
            </Form>
            
            {/* 操作按钮 */}
            <Space style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                onClick={handleBatchDelete}
                disabled={selectedRowKeys.length === 0}
              >
                批量删除 ({selectedRowKeys.length})
              </Button>
              {/* 仅在未导出标签页显示导出按钮 */}
              {activeNestedTab === 'unexported' && (
                <Button
                  type="primary"
                  icon={<ExportOutlined />}
                  onClick={handleExport}
                  disabled={selectedUnexportedRowKeys.length === 0}
                >
                  批量导出 ({selectedUnexportedRowKeys.length})
                </Button>
              )}
            </Space>
            
            {/* 嵌套标签页，用于切换查询结果、未导出、已导出 */}
            <Tabs 
              defaultActiveKey="all" 
              size="middle" 
              activeKey={activeNestedTab}
              onChange={(key) => {
                setActiveNestedTab(key);
                // 根据切换的标签页重新查询数据
                if (key === 'all') {
                  handleQuery(); // 查询所有号码
                } else if (key === 'unexported') {
                  handleQuery(false); // 查询未导出号码
                } else if (key === 'exported') {
                  handleQuery(true); // 查询已导出号码
                }
              }}
            >
              {/* 查询结果标签页 - 显示所有号码 */}
              <TabPane tab="查询结果" key="all">
                <Table
                  columns={columns}
                  dataSource={numbers}
                  rowKey="_id"
                  rowSelection={rowSelection}
                  loading={queryLoading}
                  pagination={{
                    total,
                    current: currentPage,
                    pageSize,
                    onChange: (page, size) => {
                      setCurrentPage(page);
                      setPageSize(size);
                      handleQuery(); // 查询所有号码
                    },
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 条记录`,
                    pageSizeOptions: ['20', '50', '100', '200', '500', '1000', '2000', '5000']
                  }}
                  onChange={handleTableChange}
                />
              </TabPane>
              
              {/* 未导出标签页 - 显示未导出号码 */}
              <TabPane tab="未导出" key="unexported">
                <Table
                  columns={columns}
                  dataSource={numbers.filter(num => !num.exported)}
                  rowKey="_id"
                  rowSelection={{
                    selectedRowKeys: selectedUnexportedRowKeys,
                    onChange: setSelectedUnexportedRowKeys,
                  }}
                  loading={queryLoading}
                  pagination={{
                    total: numbers.filter(num => !num.exported).length,
                    current: currentPage,
                    pageSize,
                    onChange: (page, size) => {
                      setCurrentPage(page);
                      setPageSize(size);
                      handleQuery(false); // 查询未导出号码
                    },
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 条记录`,
                    pageSizeOptions: ['20', '50', '100', '200', '500', '1000', '2000', '5000']
                  }}
                  onChange={handleTableChange}
                />
              </TabPane>
              
              {/* 已导出标签页 - 显示已导出号码 */}
              <TabPane tab="已导出" key="exported">
                <Table
                  columns={[
                    ...columns,
                    {
                      title: '导出时间',
                      dataIndex: 'exportTime',
                      key: 'exportTime',
                      width: 200,
                      render: (time: string) => time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-' // 格式化导出时间
                    }
                  ]}
                  dataSource={numbers.filter(num => num.exported)}
                  rowKey="_id"
                  rowSelection={{
                    selectedRowKeys: selectedExportedRowKeys,
                    onChange: setSelectedExportedRowKeys,
                  }}
                  loading={queryLoading}
                  pagination={{
                    total: numbers.filter(num => num.exported).length,
                    current: currentPage,
                    pageSize,
                    onChange: (page, size) => {
                      setCurrentPage(page);
                      setPageSize(size);
                      handleQuery(true); // 查询已导出号码
                    },
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 条记录`,
                    pageSizeOptions: ['20', '50', '100', '200', '500', '1000', '2000', '5000']
                  }}
                  onChange={handleTableChange}
                />
              </TabPane>
            </Tabs>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default WhatsAppNumberManagement;
