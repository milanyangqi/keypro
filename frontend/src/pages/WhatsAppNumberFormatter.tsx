import React, { useState } from 'react';
import { Form, Input, Button, Card, Row, Col, Select, message } from 'antd';
import { CopyOutlined, FormatPainterOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

// 全球所有国家/地区区号
const countryCodeOptions = [
  { code: '+1', name: '美国/加拿大' },
  { code: '+7', name: '俄罗斯' },
  { code: '+7', name: '哈萨克斯坦' },
  { code: '+20', name: '埃及' },
  { code: '+27', name: '南非' },
  { code: '+30', name: '希腊' },
  { code: '+31', name: '荷兰' },
  { code: '+32', name: '比利时' },
  { code: '+33', name: '法国' },
  { code: '+34', name: '西班牙' },
  { code: '+350', name: '直布罗陀' },
  { code: '+351', name: '葡萄牙' },
  { code: '+352', name: '卢森堡' },
  { code: '+353', name: '爱尔兰' },
  { code: '+354', name: '冰岛' },
  { code: '+355', name: '阿尔巴尼亚' },
  { code: '+356', name: '马耳他' },
  { code: '+357', name: '塞浦路斯' },
  { code: '+358', name: '芬兰' },
  { code: '+359', name: '保加利亚' },
  { code: '+36', name: '匈牙利' },
  { code: '+370', name: '立陶宛' },
  { code: '+371', name: '拉脱维亚' },
  { code: '+372', name: '爱沙尼亚' },
  { code: '+373', name: '摩尔多瓦' },
  { code: '+374', name: '亚美尼亚' },
  { code: '+375', name: '白俄罗斯' },
  { code: '+376', name: '安道尔' },
  { code: '+377', name: '摩纳哥' },
  { code: '+378', name: '圣马力诺' },
  { code: '+379', name: '梵蒂冈' },
  { code: '+380', name: '乌克兰' },
  { code: '+381', name: '塞尔维亚' },
  { code: '+382', name: '黑山' },
  { code: '+383', name: '科索沃' },
  { code: '+385', name: '克罗地亚' },
  { code: '+386', name: '斯洛文尼亚' },
  { code: '+387', name: '波黑' },
  { code: '+389', name: '北马其顿' },
  { code: '+39', name: '意大利' },
  { code: '+40', name: '罗马尼亚' },
  { code: '+41', name: '瑞士' },
  { code: '+420', name: '捷克' },
  { code: '+421', name: '斯洛伐克' },
  { code: '+423', name: '列支敦士登' },
  { code: '+43', name: '奥地利' },
  { code: '+44', name: '英国' },
  { code: '+45', name: '丹麦' },
  { code: '+46', name: '瑞典' },
  { code: '+47', name: '挪威' },
  { code: '+48', name: '波兰' },
  { code: '+49', name: '德国' },
  { code: '+500', name: '福克兰群岛' },
  { code: '+501', name: '伯利兹' },
  { code: '+502', name: '危地马拉' },
  { code: '+503', name: '萨尔瓦多' },
  { code: '+504', name: '洪都拉斯' },
  { code: '+505', name: '尼加拉瓜' },
  { code: '+506', name: '哥斯达黎加' },
  { code: '+507', name: '巴拿马' },
  { code: '+508', name: '圣皮埃尔和密克隆' },
  { code: '+509', name: '海地' },
  { code: '+51', name: '秘鲁' },
  { code: '+52', name: '墨西哥' },
  { code: '+53', name: '古巴' },
  { code: '+54', name: '阿根廷' },
  { code: '+55', name: '巴西' },
  { code: '+56', name: '智利' },
  { code: '+57', name: '哥伦比亚' },
  { code: '+58', name: '委内瑞拉' },
  { code: '+590', name: '瓜德罗普' },
  { code: '+591', name: '玻利维亚' },
  { code: '+592', name: '圭亚那' },
  { code: '+593', name: '厄瓜多尔' },
  { code: '+594', name: '法属圭亚那' },
  { code: '+595', name: '巴拉圭' },
  { code: '+596', name: '马提尼克' },
  { code: '+597', name: '苏里南' },
  { code: '+598', name: '乌拉圭' },
  { code: '+599', name: '荷属安的列斯' },
  { code: '+60', name: '马来西亚' },
  { code: '+61', name: '澳大利亚' },
  { code: '+62', name: '印度尼西亚' },
  { code: '+63', name: '菲律宾' },
  { code: '+64', name: '新西兰' },
  { code: '+65', name: '新加坡' },
  { code: '+66', name: '泰国' },
  { code: '+670', name: '东帝汶' },
  { code: '+672', name: '澳大利亚海外领地' },
  { code: '+673', name: '文莱' },
  { code: '+674', name: '瑙鲁' },
  { code: '+675', name: '巴布亚新几内亚' },
  { code: '+676', name: '汤加' },
  { code: '+677', name: '所罗门群岛' },
  { code: '+678', name: '瓦努阿图' },
  { code: '+679', name: '斐济' },
  { code: '+680', name: '帕劳' },
  { code: '+681', name: '瓦利斯和富图纳' },
  { code: '+682', name: '库克群岛' },
  { code: '+683', name: '纽埃' },
  { code: '+685', name: '萨摩亚' },
  { code: '+686', name: '基里巴斯' },
  { code: '+687', name: '新喀里多尼亚' },
  { code: '+688', name: '图瓦卢' },
  { code: '+689', name: '法属波利尼西亚' },
  { code: '+690', name: '托克劳' },
  { code: '+691', name: '密克罗尼西亚' },
  { code: '+692', name: '马绍尔群岛' },
  { code: '+81', name: '日本' },
  { code: '+82', name: '韩国' },
  { code: '+84', name: '越南' },
  { code: '+850', name: '朝鲜' },
  { code: '+852', name: '香港' },
  { code: '+853', name: '澳门' },
  { code: '+86', name: '中国' },
  { code: '+880', name: '孟加拉国' },
  { code: '+886', name: '台湾' },
  { code: '+90', name: '土耳其' },
  { code: '+91', name: '印度' },
  { code: '+92', name: '巴基斯坦' },
  { code: '+93', name: '阿富汗' },
  { code: '+94', name: '斯里兰卡' },
  { code: '+95', name: '缅甸' },
  { code: '+960', name: '马尔代夫' },
  { code: '+961', name: '黎巴嫩' },
  { code: '+962', name: '约旦' },
  { code: '+963', name: '叙利亚' },
  { code: '+964', name: '伊拉克' },
  { code: '+965', name: '科威特' },
  { code: '+966', name: '沙特阿拉伯' },
  { code: '+967', name: '也门' },
  { code: '+968', name: '阿曼' },
  { code: '+970', name: '巴勒斯坦' },
  { code: '+971', name: '阿联酋' },
  { code: '+972', name: '以色列' },
  { code: '+973', name: '巴林' },
  { code: '+974', name: '卡塔尔' },
  { code: '+975', name: '不丹' },
  { code: '+976', name: '蒙古' },
  { code: '+977', name: '尼泊尔' },
  { code: '+98', name: '伊朗' },
  { code: '+992', name: '塔吉克斯坦' },
  { code: '+993', name: '土库曼斯坦' },
  { code: '+994', name: '阿塞拜疆' },
  { code: '+995', name: '格鲁吉亚' },
  { code: '+996', name: '吉尔吉斯斯坦' },
  { code: '+998', name: '乌兹别克斯坦' }
];

const WhatsAppNumberFormatter: React.FC = () => {
  const [inputNumbers, setInputNumbers] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('+1');
  const [outputNumbers, setOutputNumbers] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 复制号码到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => message.success('复制成功！'))
      .catch(() => message.error('复制失败！'));
  };

  // 格式化号码
  const formatNumbers = () => {
    setLoading(true);
    try {
      if (!inputNumbers.trim()) {
        message.error('请输入要格式化的号码！');
        return;
      }

      // 处理输入的号码，每行一个
      const numbers = inputNumbers
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (numbers.length === 0) {
        message.error('请输入有效的号码！');
        return;
      }

      // 格式化每个号码，添加国家区号
      const formattedNumbers = numbers.map(number => {
        // 移除可能已有的国家区号
        let cleanedNumber = number.replace(/^\+\d+/, '').trim();
        // 移除所有非数字字符
        cleanedNumber = cleanedNumber.replace(/\D/g, '');
        // 添加国家区号
        return `${countryCode}${cleanedNumber}`;
      });

      setOutputNumbers(formattedNumbers);
      message.success(`成功格式化 ${formattedNumbers.length} 个号码！`);
    } catch (error: any) {
      message.error(error.message || '格式化失败！');
    } finally {
      setLoading(false);
    }
  };

  // 清空所有输入和输出
  const handleReset = () => {
    setInputNumbers('');
    setOutputNumbers([]);
    setCountryCode('+86');
  };

  return (
    <div>
      <h1 style={{ marginBottom: 24, fontSize: 24, fontWeight: 600 }}>WhatsApp号码格式化</h1>
      
      <Card>
        <Form layout="vertical">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item label="国家区号">
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <Select
                    value={countryCode}
                    onChange={setCountryCode}
                    showSearch
                    style={{ width: 200 }}
                    placeholder="选择国家区号"
                  >
                    {countryCodeOptions.map((option, index) => (
                      <Option key={`${option.code}-${index}`} value={option.code}>
                        {option.name} ({option.code})
                      </Option>
                    ))}
                  </Select>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ color: '#999', fontSize: 14 }}>或</span>
                    <Input
                      type="text"
                      placeholder="直接输入自定义区号（如+86）"
                      style={{ width: 200 }}
                      onChange={(e) => setCountryCode(e.target.value)}
                      value={countryCode}
                    />
                  </div>
                </div>
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item label="输入号码（一行一个）">
                <TextArea
                  rows={15}
                  placeholder="请输入WhatsApp号码，一行一个"
                  value={inputNumbers}
                  onChange={(e) => setInputNumbers(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item label="格式化结果">
                <div style={{ 
                  height: 304, 
                  border: '1px solid #d9d9d9', 
                  borderRadius: 4, 
                  padding: 12, 
                  overflowY: 'auto',
                  backgroundColor: '#fafafa' 
                }}>
                  {outputNumbers.length > 0 ? (
                    <div>
                      {outputNumbers.map((number, index) => (
                        <div key={index} style={{ marginBottom: 8, fontSize: 14 }}>
                          <span style={{ marginRight: 12, color: '#999', fontSize: 12 }}>{index + 1}.</span>
                          {number}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: '#999', textAlign: 'center', marginTop: 120 }}>
                      格式化结果将显示在这里
                    </div>
                  )}
                </div>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <div style={{ display: 'flex', gap: 16 }}>
              <Button
                type="primary"
                icon={<FormatPainterOutlined />}
                onClick={formatNumbers}
                loading={loading}
                style={{ marginRight: 16 }}
              >
                格式化号码
              </Button>
              <Button
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(outputNumbers.join('\n'))}
                disabled={outputNumbers.length === 0}
              >
                复制所有结果
              </Button>
              <Button
                onClick={handleReset}
              >
                重置
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default WhatsAppNumberFormatter;