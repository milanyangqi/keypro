import React, { useState, useEffect } from 'react';
import { Table, Input, Select, Space, Typography, Card, Row, Col, Tag } from 'antd';
import { SearchOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// 扩展dayjs插件
dayjs.extend(utc);
dayjs.extend(timezone);

// 定义城市数据类型
interface CityData {
  id: string;
  city: string;
  country: string;
  region: string;
  timezone: string;
  timeDiff: number;
  bestTime: string;
  localTime?: string;
  regionName: string;
}

const { Title, Text } = Typography;
const { Option } = Select;

const GlobalWorldTime: React.FC = () => {
  // 全球主要城市数据
  const [cities, setCities] = useState<CityData[]>([
    // 亚洲
    { id: '1', city: '北京', country: '中国', region: 'asia', timezone: 'CST', timeDiff: 0, bestTime: '09:00-17:00', regionName: '亚洲' },
    { id: '2', city: '香港', country: '中国', region: 'asia', timezone: 'HKT', timeDiff: 0, bestTime: '09:00-17:00', regionName: '亚洲' },
    { id: '3', city: '台北', country: '中国', region: 'asia', timezone: 'CST', timeDiff: 0, bestTime: '09:00-17:00', regionName: '亚洲' },
    { id: '4', city: '东京', country: '日本', region: 'asia', timezone: 'JST', timeDiff: 1, bestTime: '08:00-16:00', regionName: '亚洲' },
    { id: '5', city: '首尔', country: '韩国', region: 'asia', timezone: 'KST', timeDiff: 1, bestTime: '08:00-16:00', regionName: '亚洲' },
    { id: '6', city: '新加坡', country: '新加坡', region: 'asia', timezone: 'SGT', timeDiff: 0, bestTime: '09:00-17:00', regionName: '亚洲' },
    { id: '7', city: '曼谷', country: '泰国', region: 'asia', timezone: 'ICT', timeDiff: -1, bestTime: '10:00-18:00', regionName: '亚洲' },
    { id: '8', city: '吉隆坡', country: '马来西亚', region: 'asia', timezone: 'MYT', timeDiff: 0, bestTime: '09:00-17:00', regionName: '亚洲' },
    { id: '9', city: '雅加达', country: '印度尼西亚', region: 'asia', timezone: 'WIB', timeDiff: -1, bestTime: '10:00-18:00', regionName: '亚洲' },
    { id: '10', city: '马尼拉', country: '菲律宾', region: 'asia', timezone: 'PHT', timeDiff: 0, bestTime: '09:00-17:00', regionName: '亚洲' },
    { id: '11', city: '新德里', country: '印度', region: 'asia', timezone: 'IST', timeDiff: -2.5, bestTime: '11:30-19:30', regionName: '亚洲' },
    { id: '12', city: '孟买', country: '印度', region: 'asia', timezone: 'IST', timeDiff: -2.5, bestTime: '11:30-19:30', regionName: '亚洲' },
    { id: '13', city: '河内', country: '越南', region: 'asia', timezone: 'ICT', timeDiff: -1, bestTime: '10:00-18:00', regionName: '亚洲' },
    { id: '14', city: '胡志明市', country: '越南', region: 'asia', timezone: 'ICT', timeDiff: -1, bestTime: '10:00-18:00', regionName: '亚洲' },
    { id: '15', city: '仰光', country: '缅甸', region: 'asia', timezone: 'MMT', timeDiff: -1.5, bestTime: '10:30-18:30', regionName: '亚洲' },
    { id: '16', city: '达卡', country: '孟加拉国', region: 'asia', timezone: 'BST', timeDiff: -2, bestTime: '11:00-19:00', regionName: '亚洲' },
    { id: '17', city: '伊斯兰堡', country: '巴基斯坦', region: 'asia', timezone: 'PKT', timeDiff: -3, bestTime: '12:00-20:00', regionName: '亚洲' },
    { id: '18', city: '卡拉奇', country: '巴基斯坦', region: 'asia', timezone: 'PKT', timeDiff: -3, bestTime: '12:00-20:00', regionName: '亚洲' },
    
    // 中东
    { id: '19', city: '迪拜', country: '阿联酋', region: 'middle-east', timezone: 'GST', timeDiff: -4, bestTime: '13:00-21:00', regionName: '中东' },
    { id: '20', city: '阿布扎比', country: '阿联酋', region: 'middle-east', timezone: 'GST', timeDiff: -4, bestTime: '13:00-21:00', regionName: '中东' },
    { id: '21', city: '利雅得', country: '沙特阿拉伯', region: 'middle-east', timezone: 'AST', timeDiff: -5, bestTime: '14:00-22:00', regionName: '中东' },
    { id: '22', city: '多哈', country: '卡塔尔', region: 'middle-east', timezone: 'AST', timeDiff: -5, bestTime: '14:00-22:00', regionName: '中东' },
    { id: '23', city: '麦纳麦', country: '巴林', region: 'middle-east', timezone: 'AST', timeDiff: -5, bestTime: '14:00-22:00', regionName: '中东' },
    { id: '24', city: '科威特城', country: '科威特', region: 'middle-east', timezone: 'AST', timeDiff: -5, bestTime: '14:00-22:00', regionName: '中东' },
    { id: '25', city: '伊斯坦布尔', country: '土耳其', region: 'middle-east', timezone: 'TRT', timeDiff: -5, bestTime: '14:00-22:00', regionName: '中东' },
    { id: '26', city: '德黑兰', country: '伊朗', region: 'middle-east', timezone: 'IRST', timeDiff: -4.5, bestTime: '13:30-21:30', regionName: '中东' },
    
    // 欧洲
    { id: '27', city: '伦敦', country: '英国', region: 'europe', timezone: 'GMT', timeDiff: -8, bestTime: '17:00-01:00', regionName: '欧洲' },
    { id: '28', city: '巴黎', country: '法国', region: 'europe', timezone: 'CET', timeDiff: -7, bestTime: '16:00-00:00', regionName: '欧洲' },
    { id: '29', city: '柏林', country: '德国', region: 'europe', timezone: 'CET', timeDiff: -7, bestTime: '16:00-00:00', regionName: '欧洲' },
    { id: '30', city: '罗马', country: '意大利', region: 'europe', timezone: 'CET', timeDiff: -7, bestTime: '16:00-00:00', regionName: '欧洲' },
    { id: '31', city: '马德里', country: '西班牙', region: 'europe', timezone: 'CET', timeDiff: -7, bestTime: '16:00-00:00', regionName: '欧洲' },
    { id: '32', city: '阿姆斯特丹', country: '荷兰', region: 'europe', timezone: 'CET', timeDiff: -7, bestTime: '16:00-00:00', regionName: '欧洲' },
    { id: '33', city: '布鲁塞尔', country: '比利时', region: 'europe', timezone: 'CET', timeDiff: -7, bestTime: '16:00-00:00', regionName: '欧洲' },
    { id: '34', city: '维也纳', country: '奥地利', region: 'europe', timezone: 'CET', timeDiff: -7, bestTime: '16:00-00:00', regionName: '欧洲' },
    { id: '35', city: '苏黎世', country: '瑞士', region: 'europe', timezone: 'CET', timeDiff: -7, bestTime: '16:00-00:00', regionName: '欧洲' },
    { id: '36', city: '斯德哥尔摩', country: '瑞典', region: 'europe', timezone: 'CET', timeDiff: -7, bestTime: '16:00-00:00', regionName: '欧洲' },
    { id: '37', city: '奥斯陆', country: '挪威', region: 'europe', timezone: 'CET', timeDiff: -7, bestTime: '16:00-00:00', regionName: '欧洲' },
    { id: '38', city: '哥本哈根', country: '丹麦', region: 'europe', timezone: 'CET', timeDiff: -7, bestTime: '16:00-00:00', regionName: '欧洲' },
    { id: '39', city: '赫尔辛基', country: '芬兰', region: 'europe', timezone: 'EET', timeDiff: -6, bestTime: '15:00-23:00', regionName: '欧洲' },
    { id: '40', city: '华沙', country: '波兰', region: 'europe', timezone: 'CET', timeDiff: -7, bestTime: '16:00-00:00', regionName: '欧洲' },
    { id: '41', city: '布拉格', country: '捷克', region: 'europe', timezone: 'CET', timeDiff: -7, bestTime: '16:00-00:00', regionName: '欧洲' },
    { id: '42', city: '布达佩斯', country: '匈牙利', region: 'europe', timezone: 'CET', timeDiff: -7, bestTime: '16:00-00:00', regionName: '欧洲' },
    { id: '43', city: '莫斯科', country: '俄罗斯', region: 'europe', timezone: 'MSK', timeDiff: -5, bestTime: '14:00-22:00', regionName: '欧洲' },
    
    // 美洲
    { id: '44', city: '纽约', country: '美国', region: 'americas', timezone: 'EST', timeDiff: -13, bestTime: '22:00-06:00', regionName: '美洲' },
    { id: '45', city: '洛杉矶', country: '美国', region: 'americas', timezone: 'PST', timeDiff: -16, bestTime: '01:00-09:00', regionName: '美洲' },
    { id: '46', city: '芝加哥', country: '美国', region: 'americas', timezone: 'CST', timeDiff: -14, bestTime: '23:00-07:00', regionName: '美洲' },
    { id: '47', city: '迈阿密', country: '美国', region: 'americas', timezone: 'EST', timeDiff: -13, bestTime: '22:00-06:00', regionName: '美洲' },
    { id: '48', city: '波士顿', country: '美国', region: 'americas', timezone: 'EST', timeDiff: -13, bestTime: '22:00-06:00', regionName: '美洲' },
    { id: '49', city: '旧金山', country: '美国', region: 'americas', timezone: 'PST', timeDiff: -16, bestTime: '01:00-09:00', regionName: '美洲' },
    { id: '50', city: '华盛顿', country: '美国', region: 'americas', timezone: 'EST', timeDiff: -13, bestTime: '22:00-06:00', regionName: '美洲' },
    { id: '51', city: '多伦多', country: '加拿大', region: 'americas', timezone: 'EST', timeDiff: -13, bestTime: '22:00-06:00', regionName: '美洲' },
    { id: '52', city: '温哥华', country: '加拿大', region: 'americas', timezone: 'PST', timeDiff: -16, bestTime: '01:00-09:00', regionName: '美洲' },
    { id: '53', city: '墨西哥城', country: '墨西哥', region: 'americas', timezone: 'CST', timeDiff: -14, bestTime: '23:00-07:00', regionName: '美洲' },
    { id: '54', city: '圣保罗', country: '巴西', region: 'americas', timezone: 'BRT', timeDiff: -11, bestTime: '20:00-04:00', regionName: '美洲' },
    { id: '55', city: '里约热内卢', country: '巴西', region: 'americas', timezone: 'BRT', timeDiff: -11, bestTime: '20:00-04:00', regionName: '美洲' },
    { id: '56', city: '布宜诺斯艾利斯', country: '阿根廷', region: 'americas', timezone: 'ART', timeDiff: -11, bestTime: '20:00-04:00', regionName: '美洲' },
    { id: '57', city: '圣地亚哥', country: '智利', region: 'americas', timezone: 'CLT', timeDiff: -12, bestTime: '21:00-05:00', regionName: '美洲' },
    { id: '58', city: '利马', country: '秘鲁', region: 'americas', timezone: 'PET', timeDiff: -13, bestTime: '22:00-06:00', regionName: '美洲' },
    { id: '59', city: '波哥大', country: '哥伦比亚', region: 'americas', timezone: 'COT', timeDiff: -13, bestTime: '22:00-06:00', regionName: '美洲' },
    { id: '60', city: '加拉加斯', country: '委内瑞拉', region: 'americas', timezone: 'VET', timeDiff: -12, bestTime: '21:00-05:00', regionName: '美洲' },
    { id: '61', city: '基多', country: '厄瓜多尔', region: 'americas', timezone: 'ECT', timeDiff: -13, bestTime: '22:00-06:00', regionName: '美洲' },
    { id: '62', city: '哈瓦那', country: '古巴', region: 'americas', timezone: 'CST', timeDiff: -13, bestTime: '22:00-06:00', regionName: '美洲' },
    { id: '63', city: '巴拿马城', country: '巴拿马', region: 'americas', timezone: 'EST', timeDiff: -13, bestTime: '22:00-06:00', regionName: '美洲' },
    { id: '64', city: '圣何塞', country: '哥斯达黎加', region: 'americas', timezone: 'CST', timeDiff: -14, bestTime: '23:00-07:00', regionName: '美洲' },
    { id: '65', city: '亚特兰大', country: '美国', region: 'americas', timezone: 'EST', timeDiff: -13, bestTime: '22:00-06:00', regionName: '美洲' },
    { id: '66', city: '西雅图', country: '美国', region: 'americas', timezone: 'PST', timeDiff: -16, bestTime: '01:00-09:00', regionName: '美洲' },
    { id: '67', city: '休斯顿', country: '美国', region: 'americas', timezone: 'CST', timeDiff: -14, bestTime: '23:00-07:00', regionName: '美洲' },
    { id: '68', city: '丹佛', country: '美国', region: 'americas', timezone: 'MST', timeDiff: -15, bestTime: '00:00-08:00', regionName: '美洲' },
    { id: '69', city: '凤凰城', country: '美国', region: 'americas', timezone: 'MST', timeDiff: -15, bestTime: '00:00-08:00', regionName: '美洲' },
    { id: '70', city: '底特律', country: '美国', region: 'americas', timezone: 'EST', timeDiff: -13, bestTime: '22:00-06:00', regionName: '美洲' },
    { id: '71', city: '蒙特利尔', country: '加拿大', region: 'americas', timezone: 'EST', timeDiff: -13, bestTime: '22:00-06:00', regionName: '美洲' },
    { id: '72', city: '渥太华', country: '加拿大', region: 'americas', timezone: 'EST', timeDiff: -13, bestTime: '22:00-06:00', regionName: '美洲' },
    { id: '73', city: '金斯敦', country: '牙买加', region: 'americas', timezone: 'EST', timeDiff: -13, bestTime: '22:00-06:00', regionName: '美洲' },
    { id: '74', city: '圣胡安', country: '波多黎各', region: 'americas', timezone: 'AST', timeDiff: -12, bestTime: '21:00-05:00', regionName: '美洲' },
    
    // 非洲
    { id: '75', city: '开罗', country: '埃及', region: 'africa', timezone: 'EET', timeDiff: -6, bestTime: '15:00-23:00', regionName: '非洲' },
    { id: '76', city: '约翰内斯堡', country: '南非', region: 'africa', timezone: 'SAST', timeDiff: -6, bestTime: '15:00-23:00', regionName: '非洲' },
    { id: '77', city: '开普敦', country: '南非', region: 'africa', timezone: 'SAST', timeDiff: -6, bestTime: '15:00-23:00', regionName: '非洲' },
    { id: '78', city: '拉各斯', country: '尼日利亚', region: 'africa', timezone: 'WAT', timeDiff: -7, bestTime: '16:00-00:00', regionName: '非洲' },
    { id: '79', city: '内罗毕', country: '肯尼亚', region: 'africa', timezone: 'EAT', timeDiff: -5, bestTime: '14:00-22:00', regionName: '非洲' },
    { id: '80', city: '卡萨布兰卡', country: '摩洛哥', region: 'africa', timezone: 'WEST', timeDiff: -7, bestTime: '16:00-00:00', regionName: '非洲' },
    { id: '81', city: '阿比让', country: '科特迪瓦', region: 'africa', timezone: 'GMT', timeDiff: -8, bestTime: '17:00-01:00', regionName: '非洲' },
    { id: '82', city: '阿克拉', country: '加纳', region: 'africa', timezone: 'GMT', timeDiff: -8, bestTime: '17:00-01:00', regionName: '非洲' },
    { id: '83', city: '达累斯萨拉姆', country: '坦桑尼亚', region: 'africa', timezone: 'EAT', timeDiff: -5, bestTime: '14:00-22:00', regionName: '非洲' },
    { id: '84', city: '亚的斯亚贝巴', country: '埃塞俄比亚', region: 'africa', timezone: 'EAT', timeDiff: -5, bestTime: '14:00-22:00', regionName: '非洲' },
    { id: '85', city: '坎帕拉', country: '乌干达', region: 'africa', timezone: 'EAT', timeDiff: -5, bestTime: '14:00-22:00', regionName: '非洲' },
    { id: '86', city: '金沙萨', country: '刚果民主共和国', region: 'africa', timezone: 'WAT', timeDiff: -7, bestTime: '16:00-00:00', regionName: '非洲' },
    { id: '87', city: '罗安达', country: '安哥拉', region: 'africa', timezone: 'WAT', timeDiff: -7, bestTime: '16:00-00:00', regionName: '非洲' },
    { id: '88', city: '达喀尔', country: '塞内加尔', region: 'africa', timezone: 'GMT', timeDiff: -8, bestTime: '17:00-01:00', regionName: '非洲' },
    { id: '89', city: '突尼斯市', country: '突尼斯', region: 'africa', timezone: 'CET', timeDiff: -7, bestTime: '16:00-00:00', regionName: '非洲' },
    { id: '90', city: '阿尔及尔', country: '阿尔及利亚', region: 'africa', timezone: 'CET', timeDiff: -7, bestTime: '16:00-00:00', regionName: '非洲' },
    { id: '91', city: '的黎波里', country: '利比亚', region: 'africa', timezone: 'EET', timeDiff: -6, bestTime: '15:00-23:00', regionName: '非洲' },
    { id: '92', city: '哈拉雷', country: '津巴布韦', region: 'africa', timezone: 'CAT', timeDiff: -6, bestTime: '15:00-23:00', regionName: '非洲' },
    { id: '93', city: '卢萨卡', country: '赞比亚', region: 'africa', timezone: 'CAT', timeDiff: -6, bestTime: '15:00-23:00', regionName: '非洲' },
    { id: '94', city: '马普托', country: '莫桑比克', region: 'africa', timezone: 'CAT', timeDiff: -6, bestTime: '15:00-23:00', regionName: '非洲' },
    { id: '95', city: '安塔那那利佛', country: '马达加斯加', region: 'africa', timezone: 'EAT', timeDiff: -5, bestTime: '14:00-22:00', regionName: '非洲' },
    
    // 大洋洲
    { id: '96', city: '悉尼', country: '澳大利亚', region: 'oceania', timezone: 'AEST', timeDiff: 2, bestTime: '07:00-15:00', regionName: '大洋洲' },
    { id: '97', city: '墨尔本', country: '澳大利亚', region: 'oceania', timezone: 'AEST', timeDiff: 2, bestTime: '07:00-15:00', regionName: '大洋洲' },
    { id: '98', city: '布里斯班', country: '澳大利亚', region: 'oceania', timezone: 'AEST', timeDiff: 2, bestTime: '07:00-15:00', regionName: '大洋洲' },
    { id: '99', city: '珀斯', country: '澳大利亚', region: 'oceania', timezone: 'AWST', timeDiff: 0, bestTime: '09:00-17:00', regionName: '大洋洲' },
    { id: '100', city: '奥克兰', country: '新西兰', region: 'oceania', timezone: 'NZST', timeDiff: 4, bestTime: '05:00-13:00', regionName: '大洋洲' },
    { id: '101', city: '阿德莱德', country: '澳大利亚', region: 'oceania', timezone: 'ACST', timeDiff: 1.5, bestTime: '07:30-15:30', regionName: '大洋洲' },
    { id: '102', city: '堪培拉', country: '澳大利亚', region: 'oceania', timezone: 'AEST', timeDiff: 2, bestTime: '07:00-15:00', regionName: '大洋洲' },
    { id: '103', city: '惠灵顿', country: '新西兰', region: 'oceania', timezone: 'NZST', timeDiff: 4, bestTime: '05:00-13:00', regionName: '大洋洲' },
    { id: '104', city: '基督城', country: '新西兰', region: 'oceania', timezone: 'NZST', timeDiff: 4, bestTime: '05:00-13:00', regionName: '大洋洲' },
    { id: '105', city: '奥克兰', country: '新西兰', region: 'oceania', timezone: 'NZST', timeDiff: 4, bestTime: '05:00-13:00', regionName: '大洋洲' },
    { id: '106', city: '达尔文', country: '澳大利亚', region: 'oceania', timezone: 'ACST', timeDiff: 1.5, bestTime: '07:30-15:30', regionName: '大洋洲' },
    { id: '107', city: '霍巴特', country: '澳大利亚', region: 'oceania', timezone: 'AEST', timeDiff: 2, bestTime: '07:00-15:00', regionName: '大洋洲' },
  ]);

  const [filteredCities, setFilteredCities] = useState<CityData[]>(cities);
  const [searchText, setSearchText] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [currentTime, setCurrentTime] = useState(dayjs());

  // 主要城市实时时间显示 - 48个城市，包含国家信息
  const majorCities = [
    // 亚洲 (12个)
    { name: '北京', country: '中国', timezone: 'Asia/Shanghai', timeDiff: 0 },
    { name: '东京', country: '日本', timezone: 'Asia/Tokyo', timeDiff: 1 },
    { name: '首尔', country: '韩国', timezone: 'Asia/Seoul', timeDiff: 1 },
    { name: '新加坡', country: '新加坡', timezone: 'Asia/Singapore', timeDiff: 0 },
    { name: '香港', country: '中国', timezone: 'Asia/Hong_Kong', timeDiff: 0 },
    { name: '孟买', country: '印度', timezone: 'Asia/Kolkata', timeDiff: -2.5 },
    { name: '曼谷', country: '泰国', timezone: 'Asia/Bangkok', timeDiff: -1 },
    { name: '吉隆坡', country: '马来西亚', timezone: 'Asia/Kuala_Lumpur', timeDiff: 0 },
    { name: '雅加达', country: '印度尼西亚', timezone: 'Asia/Jakarta', timeDiff: -1 },
    { name: '迪拜', country: '阿联酋', timezone: 'Asia/Dubai', timeDiff: -4 },
    { name: '新德里', country: '印度', timezone: 'Asia/Kolkata', timeDiff: -2.5 },
    { name: '伊斯兰堡', country: '巴基斯坦', timezone: 'Asia/Karachi', timeDiff: -3 },
    
    // 欧洲 (12个)
    { name: '伦敦', country: '英国', timezone: 'Europe/London', timeDiff: -8 },
    { name: '巴黎', country: '法国', timezone: 'Europe/Paris', timeDiff: -7 },
    { name: '柏林', country: '德国', timezone: 'Europe/Berlin', timeDiff: -7 },
    { name: '莫斯科', country: '俄罗斯', timezone: 'Europe/Moscow', timeDiff: -5 },
    { name: '罗马', country: '意大利', timezone: 'Europe/Rome', timeDiff: -7 },
    { name: '马德里', country: '西班牙', timezone: 'Europe/Madrid', timeDiff: -7 },
    { name: '阿姆斯特丹', country: '荷兰', timezone: 'Europe/Amsterdam', timeDiff: -7 },
    { name: '维也纳', country: '奥地利', timezone: 'Europe/Vienna', timeDiff: -7 },
    { name: '苏黎世', country: '瑞士', timezone: 'Europe/Zurich', timeDiff: -7 },
    { name: '斯德哥尔摩', country: '瑞典', timezone: 'Europe/Stockholm', timeDiff: -7 },
    { name: '赫尔辛基', country: '芬兰', timezone: 'Europe/Helsinki', timeDiff: -6 },
    { name: '华沙', country: '波兰', timezone: 'Europe/Warsaw', timeDiff: -7 },
    
    // 美洲 (12个)
    { name: '纽约', country: '美国', timezone: 'America/New_York', timeDiff: -13 },
    { name: '洛杉矶', country: '美国', timezone: 'America/Los_Angeles', timeDiff: -16 },
    { name: '多伦多', country: '加拿大', timezone: 'America/Toronto', timeDiff: -13 },
    { name: '芝加哥', country: '美国', timezone: 'America/Chicago', timeDiff: -14 },
    { name: '旧金山', country: '美国', timezone: 'America/San_Francisco', timeDiff: -16 },
    { name: '迈阿密', country: '美国', timezone: 'America/Miami', timeDiff: -13 },
    { name: '华盛顿', country: '美国', timezone: 'America/Washington', timeDiff: -13 },
    { name: '圣保罗', country: '巴西', timezone: 'America/Sao_Paulo', timeDiff: -11 },
    { name: '墨西哥城', country: '墨西哥', timezone: 'America/Mexico_City', timeDiff: -14 },
    { name: '布宜诺斯艾利斯', country: '阿根廷', timezone: 'America/Argentina/Buenos_Aires', timeDiff: -11 },
    { name: '圣地亚哥', country: '智利', timezone: 'America/Santiago', timeDiff: -12 },
    { name: '温哥华', country: '加拿大', timezone: 'America/Vancouver', timeDiff: -16 },
    
    // 大洋洲 & 非洲 (12个)
    { name: '悉尼', country: '澳大利亚', timezone: 'Australia/Sydney', timeDiff: 2 },
    { name: '墨尔本', country: '澳大利亚', timezone: 'Australia/Melbourne', timeDiff: 2 },
    { name: '奥克兰', country: '新西兰', timezone: 'Pacific/Auckland', timeDiff: 4 },
    { name: '约翰内斯堡', country: '南非', timezone: 'Africa/Johannesburg', timeDiff: -6 },
    { name: '开罗', country: '埃及', timezone: 'Africa/Cairo', timeDiff: -6 },
    { name: '开普敦', country: '南非', timezone: 'Africa/Johannesburg', timeDiff: -6 },
    { name: '内罗毕', country: '肯尼亚', timezone: 'Africa/Nairobi', timeDiff: -5 },
    { name: '珀斯', country: '澳大利亚', timezone: 'Australia/Perth', timeDiff: 0 },
    { name: '阿德莱德', country: '澳大利亚', timezone: 'Australia/Adelaide', timeDiff: 1.5 },
    { name: '堪培拉', country: '澳大利亚', timezone: 'Australia/Canberra', timeDiff: 2 },
    { name: '惠灵顿', country: '新西兰', timezone: 'Pacific/Auckland', timeDiff: 4 },
    { name: '卡萨布兰卡', country: '摩洛哥', timezone: 'Africa/Casablanca', timeDiff: -8 },
  ];

  // 安全获取时区时间，处理无效时区
  const getSafeTime = (timezone: string) => {
    try {
      return currentTime.tz(timezone).format('HH:mm:ss');
    } catch (error) {
      console.error(`Invalid timezone: ${timezone}`, error);
      return '00:00:00';
    }
  };

  // 更新所有城市的当地时间
  const updateLocalTimes = () => {
    const now = dayjs();
    const updatedCities = cities.map(city => {
      let localTime;
      try {
        // 根据时区计算当地时间
        if (city.timezone === 'CST' && city.city === '北京') {
          localTime = now.tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');
        } else if (city.timezone === 'CST' && city.city === '芝加哥') {
          localTime = now.tz('America/Chicago').format('YYYY-MM-DD HH:mm:ss');
        } else if (city.timezone === 'EST') {
          localTime = now.tz('America/New_York').format('YYYY-MM-DD HH:mm:ss');
        } else if (city.timezone === 'PST') {
          localTime = now.tz('America/Los_Angeles').format('YYYY-MM-DD HH:mm:ss');
        } else if (city.timezone === 'GMT') {
          localTime = now.tz('Europe/London').format('YYYY-MM-DD HH:mm:ss');
        } else if (city.timezone === 'CET') {
          localTime = now.tz('Europe/Paris').format('YYYY-MM-DD HH:mm:ss');
        } else if (city.timezone === 'JST') {
          localTime = now.tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss');
        } else if (city.timezone === 'KST') {
          localTime = now.tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
        } else if (city.timezone === 'SGT' || city.timezone === 'MYT' || city.timezone === 'HKT') {
          localTime = now.tz('Asia/Singapore').format('YYYY-MM-DD HH:mm:ss');
        } else if (city.timezone === 'ICT') {
          localTime = now.tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
        } else if (city.timezone === 'IST' && city.region === 'asia') {
          localTime = now.tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
        } else if (city.timezone === 'PKT') {
          localTime = now.tz('Asia/Karachi').format('YYYY-MM-DD HH:mm:ss');
        } else if (city.timezone === 'GST') {
          localTime = now.tz('Asia/Dubai').format('YYYY-MM-DD HH:mm:ss');
        } else if (city.timezone === 'TRT') {
          localTime = now.tz('Europe/Istanbul').format('YYYY-MM-DD HH:mm:ss');
        } else if (city.timezone === 'IRST') {
          localTime = now.tz('Asia/Tehran').format('YYYY-MM-DD HH:mm:ss');
        } else if (city.timezone === 'MSK') {
          localTime = now.tz('Europe/Moscow').format('YYYY-MM-DD HH:mm:ss');
        } else if (city.timezone === 'EET') {
          localTime = now.tz('Europe/Helsinki').format('YYYY-MM-DD HH:mm:ss');
        } else if (city.timezone === 'BRT') {
          localTime = now.tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss');
        } else if (city.timezone === 'SAST') {
          localTime = now.tz('Africa/Johannesburg').format('YYYY-MM-DD HH:mm:ss');
        } else if (city.timezone === 'WAT') {
          localTime = now.tz('Africa/Lagos').format('YYYY-MM-DD HH:mm:ss');
        } else if (city.timezone === 'EAT') {
          localTime = now.tz('Africa/Nairobi').format('YYYY-MM-DD HH:mm:ss');
        } else if (city.timezone === 'AEST') {
          localTime = now.tz('Australia/Sydney').format('YYYY-MM-DD HH:mm:ss');
        } else if (city.timezone === 'AWST') {
          localTime = now.tz('Australia/Perth').format('YYYY-MM-DD HH:mm:ss');
        } else if (city.timezone === 'NZST') {
          localTime = now.tz('Pacific/Auckland').format('YYYY-MM-DD HH:mm:ss');
        } else {
          // 默认使用北京时间
          localTime = now.format('YYYY-MM-DD HH:mm:ss');
        }
      } catch (error) {
        localTime = now.format('YYYY-MM-DD HH:mm:ss');
      }
      
      return { ...city, localTime };
    });

    setCities(updatedCities);
    filterCities(searchText, regionFilter, updatedCities);
  };

  // 过滤城市
  const filterCities = (text: string, region: string, cityList: CityData[] = cities) => {
    let result = cityList;

    // 搜索过滤
    if (text) {
      result = result.filter(city => 
        city.city.toLowerCase().includes(text.toLowerCase()) ||
        city.country.toLowerCase().includes(text.toLowerCase())
      );
    }

    // 地区过滤
    if (region !== 'all') {
      result = result.filter(city => city.region === region);
    }

    setFilteredCities(result);
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchText(value);
    filterCities(value, regionFilter);
  };

  // 处理地区筛选
  const handleRegionChange = (value: string) => {
    setRegionFilter(value);
    filterCities(searchText, value);
  };

  // 每秒更新时间
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs());
      updateLocalTimes();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 表格列配置
  const columns: ColumnType<CityData>[] = [
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
      sorter: (a, b) => a.city.localeCompare(b.city),
      render: (city, record) => (
        <Space>
          <Text strong>{city}</Text>
          <Tag color="blue">{record.country}</Tag>
        </Space>
      ),
    },
    {
      title: '地区',
      dataIndex: 'regionName',
      key: 'regionName',
      sorter: (a, b) => a.regionName.localeCompare(b.regionName),
      filters: [
        { text: '亚洲', value: '亚洲' },
        { text: '欧洲', value: '欧洲' },
        { text: '美洲', value: '美洲' },
        { text: '非洲', value: '非洲' },
        { text: '大洋洲', value: '大洋洲' },
        { text: '中东', value: '中东' },
      ],
      onFilter: (value, record) => record.regionName === value,
      render: (regionName) => <Tag color="green">{regionName}</Tag>,
    },
    {
      title: '时区',
      dataIndex: 'timezone',
      key: 'timezone',
      sorter: (a, b) => a.timezone.localeCompare(b.timezone),
    },
    {
      title: '当地时间',
      dataIndex: 'localTime',
      key: 'localTime',
      sorter: (a, b) => {
        if (!a.localTime || !b.localTime) return 0;
        return dayjs(a.localTime).valueOf() - dayjs(b.localTime).valueOf();
      },
      render: (localTime) => <Text strong className="local-time">{localTime}</Text>,
    },
    {
      title: '与北京时间时差',
      key: 'timeDiff',
      sorter: (a, b) => a.timeDiff - b.timeDiff,
      render: (_, record) => {
        const diffText = record.timeDiff === 0 
          ? '相同' 
          : `${record.timeDiff > 0 ? '+' : ''}${record.timeDiff}小时`;
        const diffClass = record.timeDiff === 0 
          ? 'default' 
          : record.timeDiff > 0 ? 'red' : 'green';
        return <Tag color={diffClass}>{diffText}</Tag>;
      },
    },
    {
      title: '最佳发送时间 (北京时间)',
      dataIndex: 'bestTime',
      key: 'bestTime',
      sorter: (a, b) => a.bestTime.localeCompare(b.bestTime),
      render: (bestTime) => <Tag color="success" className="best-time">{bestTime}</Tag>,
    },
  ];

  return (
    <div style={{ 
      padding: '0', 
      background: '#f0f2f5',
      minHeight: '100vh' 
    }}>
      {/* 渐变背景头部 */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px 20px',
        marginBottom: '20px',
        borderRadius: '0 0 16px 16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <Title level={2} style={{ 
          margin: '0 0 10px 0', 
          textAlign: 'center',
          color: '#fff',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          fontSize: '28px'
        }}>
          <ClockCircleOutlined style={{ marginRight: '10px' }} /> 全球各地时间
        </Title>
        <Text style={{ 
          display: 'block', 
          textAlign: 'center', 
          marginBottom: '30px', 
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '16px'
        }}>
          了解全球主要城市的时区、与北京时间的时差及最佳外贸沟通时间
        </Text>
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        {/* 主要城市实时时间显示 */}
        <Row gutter={[6, 6]} justify="center" style={{ marginBottom: '20px' }}>
          {majorCities.map(city => (
            <Col key={`${city.name}-${city.country}`} xs={12} sm={6} md={4} lg={3} xl={2}>
              <Card 
                size="small" 
                bordered={false}
                style={{
                  borderRadius: '6px',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)',
                  transition: 'all 0.3s ease',
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  padding: '6px',
                  minWidth: '90px',
                  height: '85px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
                hoverable
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', marginBottom: '2px', fontWeight: 'bold' }}>{city.name}</div>
                  <div style={{ fontSize: '10px', marginBottom: '4px', color: '#666' }}>{city.country}</div>
                  <div style={{ color: '#667eea', fontSize: '16px', fontWeight: 'bold' }}>
                    {getSafeTime(city.timezone)}
                  </div>
                  <div style={{ 
                    marginTop: 2,
                    color: '#666',
                    fontSize: '10px'
                  }}>
                    {city.timeDiff === 0 ? '无时差' : `${city.timeDiff > 0 ? '快' : '慢'}${Math.abs(city.timeDiff)}h`}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* 搜索和筛选控件 */}
        <Card style={{ 
          marginBottom: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)',
          border: 'none'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <Input
              placeholder="搜索城市或国家..."
              prefix={<SearchOutlined />}
              allowClear
              onChange={(e) => handleSearch(e.target.value)}
              style={{ 
                width: 300,
                borderRadius: '8px',
                border: '1px solid #d9d9d9',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
            />
            <Select
              value={regionFilter}
              onChange={handleRegionChange}
              style={{ 
                width: 150,
                borderRadius: '8px',
                border: '1px solid #d9d9d9',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
            >
              <Option value="all">所有地区</Option>
              <Option value="asia">亚洲</Option>
              <Option value="europe">欧洲</Option>
              <Option value="americas">美洲</Option>
              <Option value="africa">非洲</Option>
              <Option value="oceania">大洋洲</Option>
              <Option value="middle-east">中东</Option>
            </Select>
          </div>
        </Card>

        {/* 城市表格 */}
        <Card style={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)',
          border: 'none',
          overflow: 'hidden'
        }}>
          <Table
            columns={columns}
            dataSource={filteredCities}
            rowKey="id"
            pagination={{ 
              pageSize: 200, 
              showSizeChanger: true, 
              pageSizeOptions: ['50', '100', '200', '500'],
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
              style: {
                paddingTop: '10px'
              }
            }}
            bordered={false}
            scroll={{ x: true }}
            style={{ background: '#fff' }}
            rowClassName={(_, index) => index % 2 === 0 ? 'table-row-even' : 'table-row-odd'}
          />
        </Card>

        {/* 页脚说明 */}
        <div style={{ 
          textAlign: 'center', 
          color: '#666', 
          marginTop: '20px', 
          padding: '15px', 
          background: '#fff', 
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)'
        }}>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>注：最佳发送时间基于当地工作时间（上午9点-下午5点）计算，转换为北京时间</p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>© {new Date().getFullYear()} 科浦诺外贸管理系统 - 全球各地时间查询</p>
        </div>
      </div>
    </div>
  );
};

export default GlobalWorldTime;