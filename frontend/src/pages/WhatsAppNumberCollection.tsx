import React, { useState } from 'react';
import { Card, Input, Button, Select, Space, message, Tabs, Divider, Table, Tag, Upload } from 'antd';
import { CloseOutlined, SearchOutlined, UploadOutlined, DownloadOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import * as XLSX from 'xlsx';

const { Option } = Select;
const { TabPane } = Tabs;

// WhatsApp号码类型
interface WhatsAppNumber {
  id: string;
  number: string;
  industry: string;
  upload_time: string;
}

// 上传结果类型
interface UploadResults {
  existing: WhatsAppNumber[];
  new: WhatsAppNumber[];
}

const WhatsAppNumberCollection: React.FC = () => {
  // 搜索配置
  const [countryCodeOption, setCountryCodeOption] = useState('manual');
  const [manualCountryCode, setManualCountryCode] = useState('+86');
  const [keywords, setKeywords] = useState('');
  const [searchEngine, setSearchEngine] = useState('google_global');
  const [searchPages, setSearchPages] = useState<string>('99');
  const [searchUrl, setSearchUrl] = useState<string>('');
  
  // 采集结果
  const [collectedNumbers, setCollectedNumbers] = useState<string[]>([]);
  
  // 号码管理
  const [numberInput, setNumberInput] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [customIndustry, setCustomIndustry] = useState('');
  const [uploadResults, setUploadResults] = useState<UploadResults | null>(null);
  const [queryDate, setQueryDate] = useState(new Date().toISOString().split('T')[0]);
  const [queryResults, setQueryResults] = useState<WhatsAppNumber[]>([]);
  const [stats, setStats] = useState({ total: 0, industries: {} as Record<string, number> });

  // 搜索引擎列表
  const searchEngines = [
    { value: 'google_global', label: 'Google(全球)' },
    { value: 'google_usa', label: 'Google(美国)' },
    { value: 'bing', label: 'Bing' },
    { value: 'yahoo', label: 'Yahoo' },
  ];
  
  // 行业列表
  const industries = ['服装', '电子', '机械', '化工', '食品', '其他'];

  // 处理开始搜索
  const handleStartSearch = () => {
    try {
      // 验证输入
      if (!keywords.trim()) {
        message.error('请输入搜索关键词');
        return;
      }

      // 构建搜索URL
      let url = '';
      const finalCountryCode = countryCodeOption === 'manual' ? manualCountryCode : countryCodeOption;
      
      // 根据搜索引擎构建不同的URL
      switch (searchEngine) {
        case 'google_global':
          url = `https://www.google.com/search?q=${encodeURIComponent(keywords + ' WhatsApp ' + finalCountryCode)}`;
          break;
        case 'google_usa':
          url = `https://www.google.com/search?gl=us&q=${encodeURIComponent(keywords + ' WhatsApp ' + finalCountryCode)}`;
          break;
        case 'bing':
          url = `https://www.bing.com/search?q=${encodeURIComponent(keywords + ' WhatsApp ' + finalCountryCode)}`;
          break;
        case 'yahoo':
          url = `https://search.yahoo.com/search?p=${encodeURIComponent(keywords + ' WhatsApp ' + finalCountryCode)}`;
          break;
        default:
          url = `https://www.google.com/search?q=${encodeURIComponent(keywords + ' WhatsApp ' + finalCountryCode)}`;
      }

      // 设置搜索URL，显示搜索结果
      setSearchUrl(url);
      // 清空之前的采集结果
      setCollectedNumbers([]);
      message.success('开始搜索...');
    } catch (error) {
      console.error('搜索错误:', error);
      message.error('搜索失败，请重试');
    }
  };

  // 关闭搜索结果
  const handleCloseSearch = () => {
    setSearchUrl('');
    setCollectedNumbers([]);
  };

  // 处理文件上传
  const processFile = (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      if (file.name.endsWith('.txt')) {
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const numbers = content.split('\n')
            .map(line => line.trim())
            .filter(line => line);
          resolve(numbers);
        };
        reader.readAsText(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            
            const numbers = jsonData.map((row: any) => {
              return Object.values(row)[0]?.toString().trim() || '';
            }).filter((number: string) => number);
            
            resolve(numbers);
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        reject(new Error('不支持的文件类型'));
      }
    });
  };

  // 获取行业
  const getIndustry = () => {
    return customIndustry || selectedIndustry || '其他';
  };

  // 处理号码上传
  const handleUploadNumbers = async () => {
    try {
      let numbers: string[] = [];
      
      // 处理直接输入的号码
      if (numberInput.trim()) {
        numbers = numberInput.split('\n')
          .map(line => line.trim())
          .filter(line => line);
      }
      
      // 处理上传的文件
      if (fileList && fileList.length > 0) {
        for (const file of fileList) {
          if (file.originFileObj) {
            const fileNumbers = await processFile(file.originFileObj);
            numbers = [...new Set([...numbers, ...fileNumbers])];
          }
        }
      }
      
      if (numbers.length === 0) {
        message.error('请输入或上传WhatsApp号码');
        return;
      }
      
      const industry = getIndustry();
      
      // 模拟上传到后端
      message.loading('正在上传号码...', 2);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 模拟上传结果
      const mockUploadResults: UploadResults = {
        existing: [
          { id: '1', number: '+1234567890', industry: '服装', upload_time: new Date().toISOString() }
        ],
        new: numbers.slice(1).map((number, index) => ({
          id: `new-${index}`,
          number,
          industry,
          upload_time: new Date().toISOString()
        }))
      };
      
      setUploadResults(mockUploadResults);
      message.success('号码上传成功');
      
      // 更新统计信息
      updateStats();
      
      // 清空输入
      setNumberInput('');
      setFileList([]);
      setSelectedIndustry('');
      setCustomIndustry('');
    } catch (error) {
      console.error('上传号码错误:', error);
      message.error('上传号码失败，请重试');
    }
  };

  // 下载模板
  const handleDownloadTemplate = () => {
    try {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet([{ 'WhatsApp号码': '1234567890' }]);
      XLSX.utils.book_append_sheet(wb, ws, 'WhatsApp号码');
      
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'whatsapp_template.xlsx';
      link.click();
      
      URL.revokeObjectURL(url);
      message.success('模板下载成功');
    } catch (error) {
      console.error('下载模板错误:', error);
      message.error('下载模板失败，请重试');
    }
  };

  // 处理号码查询
  const handleQueryNumbers = async () => {
    try {
      // 模拟查询
      message.loading('正在查询号码...', 1.5);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟查询结果
      const mockQueryResults: WhatsAppNumber[] = [
        { id: '1', number: '+1234567890', industry: '服装', upload_time: new Date().toISOString() },
        { id: '2', number: '+9876543210', industry: '电子', upload_time: new Date().toISOString() },
        { id: '3', number: '+8613800138000', industry: '机械', upload_time: new Date().toISOString() }
      ];
      
      setQueryResults(mockQueryResults);
      message.success(`查询到 ${mockQueryResults.length} 个号码`);
    } catch (error) {
      console.error('查询号码错误:', error);
      message.error('查询号码失败，请重试');
    }
  };

  // 更新统计信息
  const updateStats = () => {
    // 模拟统计信息
    const mockStats = {
      total: 100,
      industries: {
        '服装': 30,
        '电子': 25,
        '机械': 20,
        '化工': 15,
        '食品': 10
      }
    };
    setStats(mockStats);
  };

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('已复制到剪贴板');
    });
  };

  // 复制所有号码
  const copyAllNumbers = (numbers: WhatsAppNumber[]) => {
    const text = numbers.map(num => num.number).join('\n');
    copyToClipboard(text);
  };

  // 从iframe中采集号码
  const handleCollectNumbers = async () => {
    try {
      // 真实场景中，这里应该实现从iframe中提取号码的逻辑
      // 由于浏览器的同源策略，直接访问iframe内容会受限
      // 以下是模拟采集，实际项目中需要使用其他方式实现
      
      // 模拟搜索和采集过程
      message.loading('正在采集号码...', 2);
      
      // 模拟从搜索结果中提取号码
      const extractNumbersFromSearchResults = () => {
        // 模拟从搜索结果中提取的号码
        const mockExtractedNumbers = [
          '+1234567890',
          '+9876543210',
          '+8613800138000',
          '+447123456789',
          '+61412345678',
          '+85212345678',
          '+886912345678',
          '+34612345678'
        ];
        return mockExtractedNumbers;
      };
      
      // 延迟模拟网络请求
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const extractedNumbers = extractNumbersFromSearchResults();
      setCollectedNumbers(extractedNumbers);
      message.success(`成功采集到 ${extractedNumbers.length} 个号码`);
    } catch (error) {
      console.error('采集号码错误:', error);
      message.error('采集号码失败，请重试');
    }
  };
  
  // 表格列配置
  const columns = [
    {
      title: 'WhatsApp号码',
      dataIndex: 'number',
      key: 'number',
      render: (number: string) => <strong>{number}</strong>,
    },
    {
      title: '所属行业',
      dataIndex: 'industry',
      key: 'industry',
      render: (industry: string) => <Tag color="blue">{industry}</Tag>,
    },
    {
      title: '上传时间',
      dataIndex: 'upload_time',
      key: 'upload_time',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: WhatsAppNumber) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<CopyOutlined />} 
            onClick={() => copyToClipboard(record.number)}
          >
            复制
          </Button>
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f2f5', 
      minHeight: '100vh'
    }}>
      <h2 style={{ marginBottom: '20px', textAlign: 'center', color: '#1f2937' }}>WhatsApp号码采集器</h2>
      
      <Tabs defaultActiveKey="1" style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* 号码采集标签页 */}
        <TabPane tab="号码采集" key="1">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* 搜索配置卡片 */}
            <Card 
              style={{ 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                borderRadius: '8px'
              }}
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* 国家/地区区号 */}
                <Space.Compact style={{ width: '100%' }}>
                  <Select
                    placeholder="手动输入"
                    value={countryCodeOption}
                    onChange={setCountryCodeOption}
                    style={{ width: '50%' }}
                  >
                    <Option value="manual">手动输入</Option>
                    <Option value="+86">中国 (+86)</Option>
                    <Option value="+1">美国 (+1)</Option>
                    <Option value="+44">英国 (+44)</Option>
                    <Option value="+61">澳大利亚 (+61)</Option>
                  </Select>
                  <Input
                    placeholder="手动输入区号，如+86"
                    value={manualCountryCode}
                    onChange={(e) => setManualCountryCode(e.target.value)}
                    style={{ width: '50%' }}
                  />
                </Space.Compact>

                {/* 关键词 */}
                <div>
                  <Input
                    placeholder="输入要搜索的关键词，如：餐厅 WhatsApp"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* 搜索引擎和搜索页数 */}
                <Space.Compact style={{ width: '100%' }}>
                  <Select
                    placeholder="选择搜索引擎"
                    value={searchEngine}
                    onChange={setSearchEngine}
                    style={{ width: '50%' }}
                  >
                    {searchEngines.map(engine => (
                      <Option key={engine.value} value={engine.value}>{engine.label}</Option>
                    ))}
                  </Select>
                  <Input
                    placeholder="搜索页数"
                    value={searchPages}
                    onChange={(e) => setSearchPages(e.target.value)}
                    style={{ width: '50%' }}
                  />
                </Space.Compact>

                {/* 开始搜索按钮 */}
                <Button 
                  type="primary" 
                  onClick={handleStartSearch} 
                  style={{ 
                    width: '100%', 
                    height: '48px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    backgroundColor: '#52c41a',
                    borderColor: '#52c41a',
                    borderRadius: '4px'
                  }}
                  icon={<SearchOutlined />}
                >
                  开始搜索
                </Button>
              </Space>
            </Card>

            {/* 搜索结果和号码采集 */}
            {searchUrl && (
              <Card 
                style={{ 
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  borderRadius: '8px'
                }}
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>搜索结果</span>
                    <Button 
                      type="text" 
                      danger 
                      icon={<CloseOutlined />} 
                      onClick={handleCloseSearch}
                    >
                      关闭搜索
                    </Button>
                  </div>
                }
              >
                <Tabs defaultActiveKey="1">
                  {/* 搜索结果 */}
              <TabPane tab="搜索页面" key="1">
                <div style={{ height: '600px', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', textAlign: 'center' }}>
                  <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>搜索结果无法直接嵌入</h3>
                  <p style={{ marginBottom: '24px', color: '#666' }}>由于 Google 等搜索引擎的安全限制，无法在 iframe 中直接显示搜索结果。</p>
                  <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f0f2f5', borderRadius: '8px', maxWidth: '500px' }}>
                    <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>搜索配置：</p>
                    <p>关键词：{keywords}</p>
                    <p>国家/地区区号：{countryCodeOption === 'manual' ? manualCountryCode : countryCodeOption}</p>
                    <p>搜索引擎：{searchEngines.find(engine => engine.value === searchEngine)?.label}</p>
                    <p>搜索页数：{searchPages}</p>
                  </div>
                  <Space size="middle">
                    <Button 
                      type="primary" 
                      onClick={() => window.open(searchUrl, '_blank')}
                    >
                      在新标签页打开搜索
                    </Button>
                    <Button 
                      type="default" 
                      onClick={handleCollectNumbers}
                    >
                      开始采集号码
                    </Button>
                  </Space>
                </div>
              </TabPane>
                  
                  {/* 采集结果 */}
                  <TabPane tab={`采集结果 (${collectedNumbers.length})`} key="2">
                    <div style={{ 
                      maxHeight: '600px', 
                      overflowY: 'auto',
                      border: '1px solid #d9d9d9', 
                      borderRadius: '4px',
                      padding: '16px'
                    }}>
                      {collectedNumbers.length > 0 ? (
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                          {collectedNumbers.map((number, index) => (
                            <div key={index} style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              padding: '8px 12px',
                              backgroundColor: '#fafafa',
                              borderRadius: '4px',
                              border: '1px solid #e8e8e8'
                            }}>
                              <span>{number}</span>
                              <Button 
                                type="text" 
                                size="small"
                                onClick={() => {
                                  navigator.clipboard.writeText(number);
                                  message.success('已复制到剪贴板');
                                }}
                              >
                                复制
                              </Button>
                            </div>
                          ))}
                        </Space>
                      ) : (
                        <div style={{ 
                          textAlign: 'center', 
                          padding: '40px 0',
                          color: '#999'
                        }}>
                          暂未采集到号码，请先点击"开始采集号码"
                        </div>
                      )}
                    </div>
                    {collectedNumbers.length > 0 && (
                      <Divider />
                    )}
                    {collectedNumbers.length > 0 && (
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <div style={{ color: '#666' }}>
                          共采集到 {collectedNumbers.length} 个号码
                        </div>
                        <Button 
                          type="default"
                          onClick={() => {
                            const allNumbers = collectedNumbers.join('\n');
                            navigator.clipboard.writeText(allNumbers);
                            message.success('已复制全部号码到剪贴板');
                          }}
                        >
                          复制全部号码
                        </Button>
                      </Space>
                    )}
                  </TabPane>
                </Tabs>
              </Card>
            )}
          </Space>
        </TabPane>
        
        {/* 号码管理标签页 */}
        <TabPane tab="号码管理" key="2">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* 上传号码卡片 */}
            <Card 
              title="上传WhatsApp号码" 
              style={{ 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                borderRadius: '8px'
              }}
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* 直接输入号码 */}
                <div>
                  <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>直接输入/粘贴号码（一行一个）</div>
                  <textarea 
                    value={numberInput}
                    onChange={(e) => setNumberInput(e.target.value)}
                    placeholder="例如：\n+1234567890\n+9876543210"
                    style={{ 
                      width: '100%', 
                      height: '120px', 
                      padding: '12px', 
                      border: '1px solid #d9d9d9', 
                      borderRadius: '4px',
                      resize: 'vertical',
                      fontSize: '14px',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
                
                {/* 上传文件 */}
                <div>
                  <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>上传文件</div>
                  <Space>
                    <Upload
                      beforeUpload={(file) => {
                        const isTxt = file.name.endsWith('.txt') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
                        if (!isTxt) {
                          message.error('仅支持 txt、xlsx 和 xls 文件');
                        }
                        return isTxt;
                      }}
                      fileList={fileList}
                      onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                      accept=".txt,.xlsx,.xls"
                      showUploadList={{
                        showRemoveIcon: true,
                        showPreviewIcon: false,
                      }}
                    >
                      <Button icon={<UploadOutlined />}>选择文件</Button>
                    </Upload>
                    <Button 
                      type="default" 
                      icon={<DownloadOutlined />} 
                      onClick={handleDownloadTemplate}
                    >
                      下载模板
                    </Button>
                  </Space>
                </div>
                
                {/* 号码所属行业 */}
                <div>
                  <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>号码所属行业</div>
                  <Space.Compact style={{ width: '100%' }}>
                    <Select
                      placeholder="选择行业"
                      value={selectedIndustry}
                      onChange={setSelectedIndustry}
                      style={{ width: '50%' }}
                    >
                      {industries.map(industry => (
                        <Option key={industry} value={industry}>{industry}</Option>
                      ))}
                    </Select>
                    <Input
                      placeholder="或手动输入行业"
                      value={customIndustry}
                      onChange={(e) => setCustomIndustry(e.target.value)}
                      style={{ width: '50%' }}
                    />
                  </Space.Compact>
                </div>
                
                {/* 开始上传按钮 */}
                <Button 
                  type="primary" 
                  onClick={handleUploadNumbers}
                  style={{ width: '100%', height: '48px' }}
                >
                  开始上传
                </Button>
                
                {/* 统计信息 */}
                <div style={{ 
                  padding: '16px', 
                  backgroundColor: '#f5f5f5', 
                  borderRadius: '4px',
                  border: '1px solid #e8e8e8'
                }}>
                  <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>统计信息</div>
                  <div style={{ marginBottom: '4px' }}>总存储号码数: {stats.total}</div>
                  <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>行业分布:</div>
                  <div style={{ marginLeft: '16px' }}>
                    {Object.entries(stats.industries).map(([industry, count]) => (
                      <div key={industry} style={{ marginBottom: '2px' }}>
                        {industry}: {count}个
                      </div>
                    ))}
                  </div>
                </div>
              </Space>
            </Card>
            
            {/* 上传结果 */}
            {uploadResults && (
              <Card 
                title="上传结果" 
                style={{ 
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  borderRadius: '8px'
                }}
              >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  {/* 已存在号码 */}
                  <div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '16px'
                    }}>
                      <h3 style={{ margin: 0 }}>已存在号码 ({uploadResults.existing.length})</h3>
                      <Button 
                        type="text" 
                        icon={<CopyOutlined />} 
                        onClick={() => copyAllNumbers(uploadResults.existing)}
                      >
                        复制全部
                      </Button>
                    </div>
                    <div style={{ 
                      maxHeight: '300px', 
                      overflowY: 'auto',
                      border: '1px solid #d9d9d9', 
                      borderRadius: '4px',
                      padding: '16px'
                    }}>
                      {uploadResults.existing.length > 0 ? (
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                          {uploadResults.existing.map((num) => (
                            <div key={num.id} style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              padding: '8px 12px',
                              backgroundColor: '#fafafa',
                              borderRadius: '4px',
                              border: '1px solid #e8e8e8'
                            }}>
                              <div>
                                <div>{num.number}</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                  行业: {num.industry} | 上传时间: {new Date(num.upload_time).toLocaleString()}
                                </div>
                              </div>
                              <Button 
                                type="text" 
                                size="small"
                                onClick={() => copyToClipboard(num.number)}
                              >
                                复制
                              </Button>
                            </div>
                          ))}
                        </Space>
                      ) : (
                        <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                          没有已存在的号码
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 新上传号码 */}
                  <div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '16px'
                    }}>
                      <h3 style={{ margin: 0 }}>新上传号码 ({uploadResults.new.length})</h3>
                      <Button 
                        type="text" 
                        icon={<CopyOutlined />} 
                        onClick={() => copyAllNumbers(uploadResults.new)}
                      >
                        复制全部
                      </Button>
                    </div>
                    <div style={{ 
                      maxHeight: '300px', 
                      overflowY: 'auto',
                      border: '1px solid #d9d9d9', 
                      borderRadius: '4px',
                      padding: '16px'
                    }}>
                      {uploadResults.new.length > 0 ? (
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                          {uploadResults.new.map((num) => (
                            <div key={num.id} style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              padding: '8px 12px',
                              backgroundColor: '#fafafa',
                              borderRadius: '4px',
                              border: '1px solid #e8e8e8'
                            }}>
                              <div>
                                <div>{num.number}</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                  行业: {num.industry} | 上传时间: {new Date(num.upload_time).toLocaleString()}
                                </div>
                              </div>
                              <Button 
                                type="text" 
                                size="small"
                                onClick={() => copyToClipboard(num.number)}
                              >
                                复制
                              </Button>
                            </div>
                          ))}
                        </Space>
                      ) : (
                        <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                          没有新上传的号码
                        </div>
                      )}
                    </div>
                  </div>
                </Space>
              </Card>
            )}
            
            {/* 查询号码 */}
            <Card 
              title="查询号码" 
              style={{ 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                borderRadius: '8px'
              }}
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* 查询日期 */}
                <Space>
                  <div style={{ fontWeight: 'bold', marginRight: '8px' }}>选择日期:</div>
                  <input 
                    type="date" 
                    value={queryDate}
                    onChange={(e) => setQueryDate(e.target.value)}
                    style={{ 
                      padding: '6px 12px', 
                      border: '1px solid #d9d9d9', 
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                  <Button 
                    type="primary" 
                    icon={<SearchOutlined />} 
                    onClick={handleQueryNumbers}
                  >
                    查询
                  </Button>
                </Space>
                
                {/* 查询结果 */}
                <div>
                  <h3 style={{ marginBottom: '16px' }}>查询结果 ({queryResults.length}个号码)</h3>
                  <Table
                    columns={columns}
                    dataSource={queryResults}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}
                  />
                </div>
              </Space>
            </Card>
          </Space>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default WhatsAppNumberCollection;