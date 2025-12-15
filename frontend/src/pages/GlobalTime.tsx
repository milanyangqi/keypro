import React, { useState, useEffect } from 'react';
import { Table, Input, Select, Space, Typography, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table';

interface CityData {
  state: string;
  state_en: string;
  city: string;
  city_en: string;
  type: string;
  population: number;
  timezone: string;
  timeDiff: number;
  bestTime: string;
}

const GlobalTime: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [citiesData, setCitiesData] = useState<CityData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTimezone, setSelectedTimezone] = useState<string>('all');


  // 城市数据
  const citiesDataRaw: CityData[] = [
    // 州首府
    {
      state: "阿拉巴马州",
      state_en: "Alabama",
      city: "蒙哥马利",
      city_en: "Montgomery",
      type: "州首府",
      population: 5024279,
      timezone: "CST",
      timeDiff: -14,
      bestTime: "23:00-07:00"
    },
    {
      state: "阿拉斯加州",
      state_en: "Alaska",
      city: "朱诺",
      city_en: "Juneau",
      type: "州首府",
      population: 733391,
      timezone: "AKST",
      timeDiff: -17,
      bestTime: "02:00-10:00"
    },
    {
      state: "亚利桑那州",
      state_en: "Arizona",
      city: "菲尼克斯",
      city_en: "Phoenix",
      type: "州首府",
      population: 7151502,
      timezone: "MST",
      timeDiff: -15,
      bestTime: "00:00-08:00"
    },
    {
      state: "阿肯色州",
      state_en: "Arkansas",
      city: "小石城",
      city_en: "Little Rock",
      type: "州首府",
      population: 3011524,
      timezone: "CST",
      timeDiff: -14,
      bestTime: "23:00-07:00"
    },
    {
      state: "加利福尼亚州",
      state_en: "California",
      city: "萨克拉门托",
      city_en: "Sacramento",
      type: "州首府",
      population: 39538223,
      timezone: "PST",
      timeDiff: -16,
      bestTime: "01:00-09:00"
    },
    {
      state: "科罗拉多州",
      state_en: "Colorado",
      city: "丹佛",
      city_en: "Denver",
      type: "州首府",
      population: 5773714,
      timezone: "MST",
      timeDiff: -15,
      bestTime: "00:00-08:00"
    },
    {
      state: "康涅狄格州",
      state_en: "Connecticut",
      city: "哈特福德",
      city_en: "Hartford",
      type: "州首府",
      population: 3605944,
      timezone: "EST",
      timeDiff: -13,
      bestTime: "22:00-06:00"
    },
    {
      state: "特拉华州",
      state_en: "Delaware",
      city: "多佛",
      city_en: "Dover",
      type: "州首府",
      population: 989948,
      timezone: "EST",
      timeDiff: -13,
      bestTime: "22:00-06:00"
    },
    {
      state: "佛罗里达州",
      state_en: "Florida",
      city: "塔拉哈西",
      city_en: "Tallahassee",
      type: "州首府",
      population: 21538187,
      timezone: "EST",
      timeDiff: -13,
      bestTime: "22:00-06:00"
    },
    {
      state: "佐治亚州",
      state_en: "Georgia",
      city: "亚特兰大",
      city_en: "Atlanta",
      type: "州首府",
      population: 10711908,
      timezone: "EST",
      timeDiff: -13,
      bestTime: "22:00-06:00"
    },
    {
      state: "夏威夷州",
      state_en: "Hawaii",
      city: "火奴鲁鲁",
      city_en: "Honolulu",
      type: "州首府",
      population: 1455271,
      timezone: "HST",
      timeDiff: -18,
      bestTime: "03:00-11:00"
    },
    {
      state: "爱达荷州",
      state_en: "Idaho",
      city: "博伊西",
      city_en: "Boise",
      type: "州首府",
      population: 1839106,
      timezone: "MST",
      timeDiff: -15,
      bestTime: "00:00-08:00"
    },
    {
      state: "伊利诺伊州",
      state_en: "Illinois",
      city: "斯普林菲尔德",
      city_en: "Springfield",
      type: "州首府",
      population: 12812508,
      timezone: "CST",
      timeDiff: -14,
      bestTime: "23:00-07:00"
    },
    {
      state: "印第安纳州",
      state_en: "Indiana",
      city: "印第安纳波利斯",
      city_en: "Indianapolis",
      type: "州首府",
      population: 6785528,
      timezone: "EST",
      timeDiff: -13,
      bestTime: "22:00-06:00"
    },
    {
      state: "爱荷华州",
      state_en: "Iowa",
      city: "得梅因",
      city_en: "Des Moines",
      type: "州首府",
      population: 3190369,
      timezone: "CST",
      timeDiff: -14,
      bestTime: "23:00-07:00"
    },
    {
      state: "堪萨斯州",
      state_en: "Kansas",
      city: "托皮卡",
      city_en: "Topeka",
      type: "州首府",
      population: 2937880,
      timezone: "CST",
      timeDiff: -14,
      bestTime: "23:00-07:00"
    },
    {
      state: "肯塔基州",
      state_en: "Kentucky",
      city: "法兰克福",
      city_en: "Frankfort",
      type: "州首府",
      population: 4505836,
      timezone: "EST",
      timeDiff: -13,
      bestTime: "22:00-06:00"
    },
    {
      state: "路易斯安那州",
      state_en: "Louisiana",
      city: "巴吞鲁日",
      city_en: "Baton Rouge",
      type: "州首府",
      population: 4657757,
      timezone: "CST",
      timeDiff: -14,
      bestTime: "23:00-07:00"
    },
    {
      state: "缅因州",
      state_en: "Maine",
      city: "奥古斯塔",
      city_en: "Augusta",
      type: "州首府",
      population: 1362359,
      timezone: "EST",
      timeDiff: -13,
      bestTime: "22:00-06:00"
    },
    {
      state: "马里兰州",
      state_en: "Maryland",
      city: "安纳波利斯",
      city_en: "Annapolis",
      type: "州首府",
      population: 6177224,
      timezone: "EST",
      timeDiff: -13,
      bestTime: "22:00-06:00"
    },
    {
      state: "马萨诸塞州",
      state_en: "Massachusetts",
      city: "波士顿",
      city_en: "Boston",
      type: "州首府",
      population: 7029917,
      timezone: "EST",
      timeDiff: -13,
      bestTime: "22:00-06:00"
    },
    {
      state: "密歇根州",
      state_en: "Michigan",
      city: "兰辛",
      city_en: "Lansing",
      type: "州首府",
      population: 10077331,
      timezone: "EST",
      timeDiff: -13,
      bestTime: "22:00-06:00"
    },
    {
      state: "明尼苏达州",
      state_en: "Minnesota",
      city: "圣保罗",
      city_en: "St. Paul",
      type: "州首府",
      population: 5706494,
      timezone: "CST",
      timeDiff: -14,
      bestTime: "23:00-07:00"
    },
    {
      state: "密西西比州",
      state_en: "Mississippi",
      city: "杰克逊",
      city_en: "Jackson",
      type: "州首府",
      population: 2961279,
      timezone: "CST",
      timeDiff: -14,
      bestTime: "23:00-07:00"
    },
    {
      state: "密苏里州",
      state_en: "Missouri",
      city: "杰斐逊城",
      city_en: "Jefferson City",
      type: "州首府",
      population: 6154913,
      timezone: "CST",
      timeDiff: -14,
      bestTime: "23:00-07:00"
    },
    {
      state: "蒙大拿州",
      state_en: "Montana",
      city: "海伦娜",
      city_en: "Helena",
      type: "州首府",
      population: 1084225,
      timezone: "MST",
      timeDiff: -15,
      bestTime: "00:00-08:00"
    },
    {
      state: "内布拉斯加州",
      state_en: "Nebraska",
      city: "林肯",
      city_en: "Lincoln",
      type: "州首府",
      population: 1961504,
      timezone: "CST",
      timeDiff: -14,
      bestTime: "23:00-07:00"
    },
    {
      state: "内华达州",
      state_en: "Nevada",
      city: "卡森城",
      city_en: "Carson City",
      type: "州首府",
      population: 3104614,
      timezone: "PST",
      timeDiff: -16,
      bestTime: "01:00-09:00"
    },
    {
      state: "新罕布什尔州",
      state_en: "New Hampshire",
      city: "康科德",
      city_en: "Concord",
      type: "州首府",
      population: 1377529,
      timezone: "EST",
      timeDiff: -13,
      bestTime: "22:00-06:00"
    },
    {
      state: "新泽西州",
      state_en: "New Jersey",
      city: "特伦顿",
      city_en: "Trenton",
      type: "州首府",
      population: 9288994,
      timezone: "EST",
      timeDiff: -13,
      bestTime: "22:00-06:00"
    },
    {
      state: "新墨西哥州",
      state_en: "New Mexico",
      city: "圣菲",
      city_en: "Santa Fe",
      type: "州首府",
      population: 2117522,
      timezone: "MST",
      timeDiff: -15,
      bestTime: "00:00-08:00"
    },
    {
      state: "纽约州",
      state_en: "New York",
      city: "奥尔巴尼",
      city_en: "Albany",
      type: "州首府",
      population: 20201249,
      timezone: "EST",
      timeDiff: -13,
      bestTime: "22:00-06:00"
    },
    {
      state: "北卡罗来纳州",
      state_en: "North Carolina",
      city: "罗利",
      city_en: "Raleigh",
      type: "州首府",
      population: 10439388,
      timezone: "EST",
      timeDiff: -13,
      bestTime: "22:00-06:00"
    },
    {
      state: "北达科他州",
      state_en: "North Dakota",
      city: "俾斯麦",
      city_en: "Bismarck",
      type: "州首府",
      population: 779094,
      timezone: "CST",
      timeDiff: -14,
      bestTime: "23:00-07:00"
    },
    {
      state: "俄亥俄州",
      state_en: "Ohio",
      city: "哥伦布",
      city_en: "Columbus",
      type: "州首府",
      population: 11799448,
      timezone: "EST",
      timeDiff: -13,
      bestTime: "22:00-06:00"
    },
    {
      state: "俄克拉荷马州",
      state_en: "Oklahoma",
      city: "俄克拉荷马城",
      city_en: "Oklahoma City",
      type: "州首府",
      population: 3959353,
      timezone: "CST",
      timeDiff: -14,
      bestTime: "23:00-07:00"
    },
    {
      state: "俄勒冈州",
      state_en: "Oregon",
      city: "塞勒姆",
      city_en: "Salem",
      type: "州首府",
      population: 4237256,
      timezone: "PST",
      timeDiff: -16,
      bestTime: "01:00-09:00"
    },
    {
      state: "宾夕法尼亚州",
      state_en: "Pennsylvania",
      city: "哈里斯堡",
      city_en: "Harrisburg",
      type: "州首府",
      population: 13002700,
      timezone: "EST",
      timeDiff: -13,
      bestTime: "22:00-06:00"
    },
    {
      state: "罗得岛州",
      state_en: "Rhode Island",
      city: "普罗维登斯",
      city_en: "Providence",
      type: "州首府",
      population: 1097379,
      timezone: "EST",
      timeDiff: -13,
      bestTime: "22:00-06:00"
    },
    {
      state: "南卡罗来纳州",
      state_en: "South Carolina",
      city: "哥伦比亚",
      city_en: "Columbia",
      type: "州首府",
      population: 5118425,
      timezone: "EST",
      timeDiff: -13,
      bestTime: "22:00-06:00"
    },
    {
      state: "南达科他州",
      state_en: "South Dakota",
      city: "皮尔",
      city_en: "Pierre",
      type: "州首府",
      population: 886667,
      timezone: "CST",
      timeDiff: -14,
      bestTime: "23:00-07:00"
    },
    {
      state: "田纳西州",
      state_en: "Tennessee",
      city: "纳什维尔",
      city_en: "Nashville",
      type: "州首府",
      population: 6910840,
      timezone: "CST",
      timeDiff: -14,
      bestTime: "23:00-07:00"
    },
    {
      state: "德克萨斯州",
      state_en: "Texas",
      city: "奥斯汀",
      city_en: "Austin",
      type: "州首府",
      population: 29145505,
      timezone: "CST",
      timeDiff: -14,
      bestTime: "23:00-07:00"
    },
    {
      state: "犹他州",
      state_en: "Utah",
      city: "盐湖城",
      city_en: "Salt Lake City",
      type: "州首府",
      population: 3271616,
      timezone: "MST",
      timeDiff: -15,
      bestTime: "00:00-08:00"
    },
    {
      state: "佛蒙特州",
      state_en: "Vermont",
      city: "蒙彼利埃",
      city_en: "Montpelier",
      type: "州首府",
      population: 643077,
      timezone: "EST",
      timeDiff: -13,
      bestTime: "22:00-06:00"
    },
    {
      state: "弗吉尼亚州",
      state_en: "Virginia",
      city: "里士满",
      city_en: "Richmond",
      type: "州首府",
      population: 8631393,
      timezone: "EST",
      timeDiff: -13,
      bestTime: "22:00-06:00"
    },
    {
      state: "华盛顿州",
      state_en: "Washington",
      city: "奥林匹亚",
      city_en: "Olympia",
      type: "州首府",
      population: 7705281,
      timezone: "PST",
      timeDiff: -16,
      bestTime: "01:00-09:00"
    },
    {
      state: "西弗吉尼亚州",
      state_en: "West Virginia",
      city: "查尔斯顿",
      city_en: "Charleston",
      type: "州首府",
      population: 1793716,
      timezone: "EST",
      timeDiff: -13,
      bestTime: "22:00-06:00"
    },
    {
      state: "威斯康星州",
      state_en: "Wisconsin",
      city: "麦迪逊",
      city_en: "Madison",
      type: "州首府",
      population: 5893718,
      timezone: "CST",
      timeDiff: -14,
      bestTime: "23:00-07:00"
    },
    {
      state: "怀俄明州",
      state_en: "Wyoming",
      city: "夏延",
      city_en: "Cheyenne",
      type: "州首府",
      population: 576851,
      timezone: "MST",
      timeDiff: -15,
      bestTime: "00:00-08:00"
    },
    {
      state: "华盛顿特区",
      state_en: "Washington D.C.",
      city: "华盛顿",
      city_en: "Washington",
      type: "州首府",
      population: 689545,
      timezone: "EST",
      timeDiff: -13,
      bestTime: "22:00-06:00"
    },
    
    // 美国其他主要大城市
    {
      state: "纽约州",
      state_en: "New York",
      city: "纽约",
      city_en: "New York City",
      type: "主要城市",
      population: 8804190,
      timezone: "EST",
      timeDiff: -13,
      bestTime: "22:00-06:00"
    },
    {
      state: "加利福尼亚州",
      state_en: "California",
      city: "洛杉矶",
      city_en: "Los Angeles",
      type: "主要城市",
      population: 3898747,
      timezone: "PST",
      timeDiff: -16,
      bestTime: "01:00-09:00"
    },
    {
      state: "伊利诺伊州",
      state_en: "Illinois",
      city: "芝加哥",
      city_en: "Chicago",
      type: "主要城市",
      population: 2746388,
      timezone: "CST",
      timeDiff: -14,
      bestTime: "23:00-07:00"
    },
    {
      state: "德克萨斯州",
      state_en: "Texas",
      city: "休斯顿",
      city_en: "Houston",
      type: "主要城市",
      population: 2304580,
      timezone: "CST",
      timeDiff: -14,
      bestTime: "23:00-07:00"
    },
    {
      state: "亚利桑那州",
      state_en: "Arizona",
      city: "凤凰城",
      city_en: "Phoenix",
      type: "主要城市",
      population: 1608139,
      timezone: "MST",
      timeDiff: -15,
      bestTime: "00:00-08:00"
    },
    {
      state: "宾夕法尼亚州",
      state_en: "Pennsylvania",
      city: "费城",
      city_en: "Philadelphia",
      type: "主要城市",
      population: 1603797,
      timezone: "EST",
      timeDiff: -13,
      bestTime: "22:00-06:00"
    },
    {
      state: "德克萨斯州",
      state_en: "Texas",
      city: "圣安东尼奥",
      city_en: "San Antonio",
      type: "主要城市",
      population: 1434625,
      timezone: "CST",
      timeDiff: -14,
      bestTime: "23:00-07:00"
    },
    {
      state: "加利福尼亚州",
      state_en: "California",
      city: "圣地亚哥",
      city_en: "San Diego",
      type: "主要城市",
      population: 1386932,
      timezone: "PST",
      timeDiff: -16,
      bestTime: "01:00-09:00"
    },
    {
      state: "德克萨斯州",
      state_en: "Texas",
      city: "达拉斯",
      city_en: "Dallas",
      type: "主要城市",
      population: 1304379,
      timezone: "CST",
      timeDiff: -14,
      bestTime: "23:00-07:00"
    },
    {
      state: "加利福尼亚州",
      state_en: "California",
      city: "圣何塞",
      city_en: "San Jose",
      type: "主要城市",
      population: 1013240,
      timezone: "PST",
      timeDiff: -16,
      bestTime: "01:00-09:00"
    },
    {
      state: "加利福尼亚州",
      state_en: "California",
      city: "旧金山",
      city_en: "San Francisco",
      type: "主要城市",
      population: 873965,
      timezone: "PST",
      timeDiff: -16,
      bestTime: "01:00-09:00"
    },
    {
      state: "华盛顿州",
      state_en: "Washington",
      city: "西雅图",
      city_en: "Seattle",
      type: "主要城市",
      population: 737015,
      timezone: "PST",
      timeDiff: -16,
      bestTime: "01:00-09:00"
    },
    {
      state: "内华达州",
      state_en: "Nevada",
      city: "拉斯维加斯",
      city_en: "Las Vegas",
      type: "主要城市",
      population: 641903,
      timezone: "PST",
      timeDiff: -16,
      bestTime: "01:00-09:00"
    },
    {
      state: "佛罗里达州",
      state_en: "Florida",
      city: "迈阿密",
      city_en: "Miami",
      type: "主要城市",
      population: 442241,
      timezone: "EST",
      timeDiff: -13,
      bestTime: "22:00-06:00"
    },
    {
      state: "密苏里州",
      state_en: "Missouri",
      city: "堪萨斯城",
      city_en: "Kansas City",
      type: "主要城市",
      population: 508394,
      timezone: "CST",
      timeDiff: -14,
      bestTime: "23:00-07:00"
    },
    {
      state: "路易斯安那州",
      state_en: "Louisiana",
      city: "新奥尔良",
      city_en: "New Orleans",
      type: "主要城市",
      population: 383997,
      timezone: "CST",
      timeDiff: -14,
      bestTime: "23:00-07:00"
    }
  ];

  // 初始化数据
  useEffect(() => {
    setCitiesData(citiesDataRaw);
  }, []);

  // 更新当前时间，每秒更新一次
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 处理搜索
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // 格式化时间
  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // 计算当地时间
  const calculateLocalTime = (timeDiff: number): string => {
    const utc = currentTime.getTime() + (currentTime.getTimezoneOffset() * 60000);
    const beijingOffset = 8;
    const localTime = new Date(utc + ((beijingOffset + timeDiff) * 3600000));
    return formatTime(localTime);
  };

  // 格式化人口数量
  const formatPopulation = (population: number): string => {
    if (population >= 10000000) {
      return (population / 10000).toFixed(0) + ' 万';
    } else {
      return (population / 10000).toFixed(1) + ' 万';
    }
  };

  // 获取时区全名
  const getTimezoneFullName = (abbr: string): string => {
    const timezoneMap: Record<string, string> = {
      'EST': '东部时间 (EST/EDT)',
      'CST': '中部时间 (CST/CDT)',
      'MST': '山地时间 (MST/MDT)',
      'PST': '太平洋时间 (PST/PDT)',
      'AKST': '阿拉斯加时间 (AKST/AKDT)',
      'HST': '夏威夷时间 (HST)'
    };
    return timezoneMap[abbr] || abbr;
  };

  // 计算北京时间
  const calculateBeijingTime = (): string => {
    const utc = currentTime.getTime() + (currentTime.getTimezoneOffset() * 60000);
    const beijingTime = new Date(utc + (8 * 3600000));
    return formatTime(beijingTime);
  };

  // 计算美国东部时间
  const calculateEasternTime = (): string => {
    const utc = currentTime.getTime() + (currentTime.getTimezoneOffset() * 60000);
    const easternTime = new Date(utc + (-5 * 3600000));
    return formatTime(easternTime);
  };

  // 计算美国中部时间
  const calculateCentralTime = (): string => {
    const utc = currentTime.getTime() + (currentTime.getTimezoneOffset() * 60000);
    const centralTime = new Date(utc + (-6 * 3600000));
    return formatTime(centralTime);
  };

  // 计算美国山地时间
  const calculateMountainTime = (): string => {
    const utc = currentTime.getTime() + (currentTime.getTimezoneOffset() * 60000);
    const mountainTime = new Date(utc + (-7 * 3600000));
    return formatTime(mountainTime);
  };

  // 计算美国太平洋时间
  const calculatePacificTime = (): string => {
    const utc = currentTime.getTime() + (currentTime.getTimezoneOffset() * 60000);
    const pacificTime = new Date(utc + (-8 * 3600000));
    return formatTime(pacificTime);
  };

  // 计算阿拉斯加时间
  const calculateAlaskaTime = (): string => {
    const utc = currentTime.getTime() + (currentTime.getTimezoneOffset() * 60000);
    const alaskaTime = new Date(utc + (-9 * 3600000));
    return formatTime(alaskaTime);
  };

  // 计算夏威夷时间
  const calculateHawaiiTime = (): string => {
    const utc = currentTime.getTime() + (currentTime.getTimezoneOffset() * 60000);
    const hawaiiTime = new Date(utc + (-10 * 3600000));
    return formatTime(hawaiiTime);
  };

  // 过滤数据
  const filteredAndSortedData = () => {
    let data = [...citiesData];

    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(city => 
        city.state.toLowerCase().includes(term) ||
        city.city.toLowerCase().includes(term) ||
        city.state_en.toLowerCase().includes(term) ||
        city.city_en.toLowerCase().includes(term)
      );
    }

    // 时区过滤
    if (selectedTimezone !== 'all') {
      data = data.filter(city => city.timezone === selectedTimezone);
    }

    return data;
  };



  const { Title, Text } = Typography;
  const { Option } = Select;

  // 定义表格列
  const columns: ColumnType<CityData>[] = [
    {
      title: '州名',
      dataIndex: 'state',
      key: 'state',
      sorter: (a, b) => a.state.localeCompare(b.state),
      render: (state, record) => (
        <Space direction="vertical" size={2}>
          <Text strong style={{ fontSize: '15px', color: '#1e293b' }}>{state}</Text>
          <Text type="secondary" style={{ fontSize: '0.85rem' }}>{record.state_en}</Text>
        </Space>
      ),
      width: 150,
    },
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
      sorter: (a, b) => a.city.localeCompare(b.city),
      render: (city, record) => (
        <Space direction="vertical" size={4}>
          <Text strong style={{ fontSize: '15px', color: '#1e293b' }}>{city}</Text>
          <Text type="secondary" style={{ fontSize: '0.85rem' }}>{record.city_en}</Text>
          <Tag color={record.type === "州首府" ? 'blue' : 'purple'}>
            {record.type === "州首府" ? "州首府" : "主要城市"}
          </Tag>
        </Space>
      ),
      width: 180,
    },
    {
      title: '城市类型',
      dataIndex: 'type',
      key: 'type',
      sorter: (a, b) => a.type.localeCompare(b.type),
      render: (type) => (
        <Text type="secondary" style={{ fontWeight: 500 }}>{type}</Text>
      ),
      width: 120,
    },
    {
      title: '人口数量',
      dataIndex: 'population',
      key: 'population',
      sorter: (a, b) => a.population - b.population,
      render: (population) => (
        <Text strong style={{ color: '#1e293b' }}>{formatPopulation(population)}</Text>
      ),
      width: 120,
    },
    {
      title: '时区',
      dataIndex: 'timezone',
      key: 'timezone',
      sorter: (a, b) => a.timezone.localeCompare(b.timezone),
      render: (timezone) => (
        <Text type="secondary" style={{ fontWeight: 500 }}>{getTimezoneFullName(timezone)}</Text>
      ),
      width: 150,
    },
    {
      title: '当地时间',
      key: 'localTime',
      sorter: (a, b) => a.timeDiff - b.timeDiff,
      render: (_, record) => (
        <Text strong style={{ color: '#667eea', fontSize: '15px', letterSpacing: '0.5px' }}>
          {calculateLocalTime(record.timeDiff)}
        </Text>
      ),
      width: 140,
    },
    {
      title: '与北京时间时差',
      key: 'timeDiff',
      sorter: (a, b) => a.timeDiff - b.timeDiff,
      render: (_, record) => {
        let timeDiffText: string;
        if (record.timeDiff === 0) {
          timeDiffText = "相同";
        } else if (record.timeDiff > 0) {
          timeDiffText = `早${record.timeDiff}小时`;
        } else {
          timeDiffText = `晚${Math.abs(record.timeDiff)}小时`;
        }
        return (
          <Text strong style={{ 
            color: record.timeDiff > 0 ? '#ef4444' : (record.timeDiff < 0 ? '#10b981' : '#6b7280')
          }}>
            {timeDiffText}
          </Text>
        );
      },
      width: 160,
    },
    {
      title: '最佳发送时间',
      dataIndex: 'bestTime',
      key: 'bestTime',
      sorter: (a, b) => {
        const parseTimeRange = (timeRange: string) => {
          const [startTime] = timeRange.split('-');
          const [hours, minutes] = startTime.split(':').map(Number);
          return hours * 60 + minutes;
        };
        return parseTimeRange(a.bestTime) - parseTimeRange(b.bestTime);
      },
      render: (bestTime) => (
        <Tag color="success" style={{ fontWeight: 'bold' }}>
          {bestTime}
        </Tag>
      ),
      width: 140,
    },
  ];

  return (
    <div style={{ 
      backgroundColor: '#f5f8fa', 
      padding: '20px', 
      minHeight: '100vh', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '1600px', 
        margin: '0 auto', 
        background: 'white', 
        borderRadius: '16px', 
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)', 
        overflow: 'hidden' 
      }}>
        {/* 顶部渐变背景 */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white', 
          padding: '40px 30px', 
          textAlign: 'center' 
        }}>
          <Title level={1} style={{ 
            color: 'white', 
            marginBottom: '15px', 
            fontWeight: 700, 
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            fontSize: '2.5rem'
          }}>
            美国各地时间
          </Title>
          <Text style={{ 
            fontSize: '1.2rem', 
            opacity: 0.95, 
            marginBottom: '30px',
            lineHeight: 1.6
          }}>
            了解美国各城市时区、人口、与北京时间的时差及最佳外贸沟通时间
          </Text>
          
          {/* 时间显示卡片 */}
          <div style={{ 
            maxWidth: '1200px',
            margin: '30px auto 0',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            {[
              { title: '北京时间', value: calculateBeijingTime() },
              { title: '东部时间 (EST)', value: calculateEasternTime() },
              { title: '中部时间 (CST)', value: calculateCentralTime() },
              { title: '山地时间 (MST)', value: calculateMountainTime() },
              { title: '太平洋时间 (PST)', value: calculatePacificTime() },
              { title: '阿拉斯加时间 (AKST)', value: calculateAlaskaTime() },
              { title: '夏威夷时间 (HST)', value: calculateHawaiiTime() }
            ].map((item, index) => (
              <div 
                key={index} 
                style={{
                  background: 'rgba(255, 255, 255, 0.15)', 
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  padding: '16px 12px',
                  minWidth: '140px',
                  flex: '1 1 140px',
                  maxWidth: '180px',
                  textAlign: 'center',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div style={{ 
                  fontSize: '0.85rem', 
                  opacity: 0.9, 
                  marginBottom: '8px',
                  fontWeight: 500,
                  color: 'white'
                }}>
                  {item.title}
                </div>
                <div style={{ 
                  fontSize: '1.35rem', 
                  fontWeight: 'bold',
                  letterSpacing: '0.5px',
                  color: 'white',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 搜索和筛选区域 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          padding: '20px 30px', 
          background: '#f8fafc', 
          borderBottom: '1px solid #e2e8f0',
          flexWrap: 'wrap',
          gap: '16px',
          alignContent: 'center'
        }}>
          <Input
            placeholder="搜索州名或城市..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={handleSearch}
            style={{ 
              width: 300,
              borderRadius: '8px',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease'
            }}
          />
          <Select
            value={selectedTimezone}
            onChange={(value) => setSelectedTimezone(value)}
            style={{ 
              width: 200,
              borderRadius: '8px',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease'
            }}
            placeholder="按时区筛选"
          >
            <Option value="all">所有时区</Option>
            <Option value="EST">东部时间 (EST)</Option>
            <Option value="CST">中部时间 (CST)</Option>
            <Option value="MST">山地时间 (MST)</Option>
            <Option value="PST">太平洋时间 (PST)</Option>
            <Option value="AKST">阿拉斯加时间 (AKST)</Option>
            <Option value="HST">夏威夷时间 (HST)</Option>
          </Select>
        </div>
        
        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={filteredAndSortedData()}
          rowKey={(_, index) => index?.toString() || ''}
          pagination={{ pageSize: 200 }}
          scroll={{ x: 1200 }}
          rowClassName={(record, index) => `timezone-${record.timezone} ${index % 2 === 0 ? 'even' : 'odd'}`}
          onRow={(_, index) => ({
            style: {
              borderBottom: '1px solid #f1f5f9',
              transition: 'all 0.2s ease',
              backgroundColor: index && index % 2 === 0 ? '#ffffff' : '#fafafa'
            },
            onMouseEnter: (e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#f0f4ff';
              (e.currentTarget as HTMLElement).style.boxShadow = 'inset 0 0 0 1px #e0e7ff';
            },
            onMouseLeave: (e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = index && index % 2 === 0 ? '#ffffff' : '#fafafa';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            },
          })}
          style={{ margin: 0 }}
        />
        
        {/* 页脚 */}
        <div style={{ 
          textAlign: 'center', 
          padding: '24px 30px', 
          background: '#f8fafc', 
          color: '#64748b', 
          fontSize: '14px',
          borderTop: '1px solid #e2e8f0'
        }}>
          <Text type="secondary" style={{ marginBottom: '8px', display: 'block', lineHeight: 1.6 }}>
            注：最佳发送时间基于当地工作时间（上午9点-下午5点）计算，转换为北京时间；人口数据为城市或州总人口估计值
          </Text>
          <Text strong style={{ color: '#475569' }}>
            © {new Date().getFullYear()} 科浦诺外贸管理系统
          </Text>
        </div>
      </div>
    </div>
  );
};

export default GlobalTime;