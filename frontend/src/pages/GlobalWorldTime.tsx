import React, { useState, useEffect } from 'react';
import { Table, Input, Space, Typography, Card } from 'antd';
import { SearchOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// 扩展dayjs插件
dayjs.extend(utc);
dayjs.extend(timezone);

// 定义城市时区类型
interface CityTimezone {
  id: string;
  city: string;
  country: string;
  timezone: string;
  gmtOffset: number;
  phonePrefix: string;
}

// 定义表格数据类型
interface TableDataType {
  key: string;
  city: string;
  country: string;
  localTime: string;
  beijingTime: string;
  gmtOffset: string;
  phonePrefix: string;
  bestSendTime: string;
}

const { Title } = Typography;

const GlobalWorldTime: React.FC = () => {
  // 模拟世界主要城市时区数据
  const cities: CityTimezone[] = [
    { id: '1', city: '北京', country: '中国', timezone: 'Asia/Shanghai', gmtOffset: 8, phonePrefix: '+86' },
    { id: '2', city: '纽约', country: '美国', timezone: 'America/New_York', gmtOffset: -5, phonePrefix: '+1' },
    { id: '3', city: '伦敦', country: '英国', timezone: 'Europe/London', gmtOffset: 0, phonePrefix: '+44' },
    { id: '4', city: '巴黎', country: '法国', timezone: 'Europe/Paris', gmtOffset: 1, phonePrefix: '+33' },
    { id: '5', city: '东京', country: '日本', timezone: 'Asia/Tokyo', gmtOffset: 9, phonePrefix: '+81' },
    { id: '6', city: '悉尼', country: '澳大利亚', timezone: 'Australia/Sydney', gmtOffset: 11, phonePrefix: '+61' },
    { id: '7', city: '莫斯科', country: '俄罗斯', timezone: 'Europe/Moscow', gmtOffset: 3, phonePrefix: '+7' },
    { id: '8', city: '迪拜', country: '阿联酋', timezone: 'Asia/Dubai', gmtOffset: 4, phonePrefix: '+971' },
    { id: '9', city: '新加坡', country: '新加坡', timezone: 'Asia/Singapore', gmtOffset: 8, phonePrefix: '+65' },
    { id: '10', city: '孟买', country: '印度', timezone: 'Asia/Kolkata', gmtOffset: 5.5, phonePrefix: '+91' },
    { id: '11', city: '多伦多', country: '加拿大', timezone: 'America/Toronto', gmtOffset: -5, phonePrefix: '+1' },
    { id: '12', city: '洛杉矶', country: '美国', timezone: 'America/Los_Angeles', gmtOffset: -8, phonePrefix: '+1' },
    { id: '13', city: '芝加哥', country: '美国', timezone: 'America/Chicago', gmtOffset: -6, phonePrefix: '+1' },
    { id: '14', city: '休斯顿', country: '美国', timezone: 'America/Chicago', gmtOffset: -6, phonePrefix: '+1' },
    { id: '15', city: '迈阿密', country: '美国', timezone: 'America/New_York', gmtOffset: -5, phonePrefix: '+1' },
  ];

  const [tableData, setTableData] = useState<TableDataType[]>([]);
  const [filteredCities, setFilteredCities] = useState<CityTimezone[]>(cities);
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'ascend' | 'descend' | null }>({ field: '', direction: null });

  // 计算各地时间
  const calculateTimes = () => {
    const now = dayjs();
    const beijingTime = now.tz('Asia/Shanghai');
    
    const data: TableDataType[] = filteredCities.map(city => {
      const localTime = now.tz(city.timezone);
      const localHour = localTime.hour();
      
      // 计算最佳发送时间（北京时间9:00-18:00）
      let bestSendTime = '';
      if (localHour >= 9 && localHour <= 18) {
        bestSendTime = '是';
      } else {
        bestSendTime = '否';
      }
      
      return {
        key: city.id,
        city: city.city,
        country: city.country,
        localTime: localTime.format('YYYY-MM-DD HH:mm:ss'),
        beijingTime: beijingTime.format('YYYY-MM-DD HH:mm:ss'),
        gmtOffset: `GMT${city.gmtOffset >= 0 ? '+' : ''}${city.gmtOffset}`,
        phonePrefix: city.phonePrefix,
        bestSendTime,
      };
    });
    
    setTableData(data);
  };

  // 初始化和每秒更新时间
  useEffect(() => {
    calculateTimes();
    const interval = setInterval(calculateTimes, 1000);
    return () => clearInterval(interval);
  }, [filteredCities]);

  // 搜索功能
  const handleSearch = (value: string) => {
    if (value) {
      const filtered = cities.filter(city => 
        city.city.includes(value) || 
        city.country.includes(value) ||
        city.phonePrefix.includes(value)
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities(cities);
    }
  };

  // 排序功能
  const handleSort = (_pagination: any, _filters: any, sorter: any) => {
    if (sorter.field && sorter.order) {
      setSortConfig({ field: sorter.field, direction: sorter.order });
      
      const sortedData = [...tableData].sort((a, b) => {
        if (sorter.field === 'localTime') {
          const timeA = dayjs(a.localTime).valueOf();
          const timeB = dayjs(b.localTime).valueOf();
          return sorter.order === 'ascend' ? timeA - timeB : timeB - timeA;
        } else if (sorter.field === 'beijingTime') {
          const timeA = dayjs(a.beijingTime).valueOf();
          const timeB = dayjs(b.beijingTime).valueOf();
          return sorter.order === 'ascend' ? timeA - timeB : timeB - timeA;
        } else {
          // 其他字段按字符串排序
          const valueA = String(a[sorter.field as keyof TableDataType]).toLowerCase();
          const valueB = String(b[sorter.field as keyof TableDataType]).toLowerCase();
          if (sorter.order === 'ascend') {
            return valueA.localeCompare(valueB);
          } else {
            return valueB.localeCompare(valueA);
          }
        }
      });
      
      setTableData(sortedData);
    }
  };

  // 列配置
  const columns: ColumnType<TableDataType>[] = [
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
      width: 120,
    },
    {
      title: '国家',
      dataIndex: 'country',
      key: 'country',
      width: 120,
    },
    {
      title: '当地时间',
      dataIndex: 'localTime',
      key: 'localTime',
      width: 180,
      sorter: true,
      sortOrder: sortConfig.field === 'localTime' ? sortConfig.direction : null,
    },
    {
      title: '北京时间',
      dataIndex: 'beijingTime',
      key: 'beijingTime',
      width: 180,
      sorter: true,
      sortOrder: sortConfig.field === 'beijingTime' ? sortConfig.direction : null,
    },
    {
      title: '时区偏移',
      dataIndex: 'gmtOffset',
      key: 'gmtOffset',
      width: 120,
    },
    {
      title: '电话前缀',
      dataIndex: 'phonePrefix',
      key: 'phonePrefix',
      width: 120,
    },
    {
      title: '最佳发送时间',
      dataIndex: 'bestSendTime',
      key: 'bestSendTime',
      width: 120,
      filters: [
        { text: '是', value: '是' },
        { text: '否', value: '否' },
      ],
      onFilter: (value: any, record: TableDataType) => record.bestSendTime === String(value),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Title level={2} style={{ margin: 0 }}>
            <ClockCircleOutlined /> 全球各地时间
          </Title>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Input
              placeholder="搜索城市、国家或电话前缀"
              prefix={<SearchOutlined />}
              allowClear
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 300 }}
            />
          </div>
          
          <Table
            columns={columns}
            dataSource={tableData}
            pagination={{ pageSize: 10 }}
            onChange={handleSort}
            rowKey="key"
            bordered
          />
          
          <div style={{ textAlign: 'center', color: '#666', marginTop: 16 }}>
            © {new Date().getFullYear()} 科浦诺外贸管理系统 - 全球各地时间查询
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default GlobalWorldTime;