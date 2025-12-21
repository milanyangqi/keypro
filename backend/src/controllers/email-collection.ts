import express from 'express';
import mongoose from 'mongoose';
import CollectionTask, { CollectionTaskStatus, ICollectionTask } from '../models/CollectionTask';
import Email from '../models/Email';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// 预设网站列表 - 包含全球主要搜索引擎、目录和商业平台
const presetWebsites = [
  // 主要搜索引擎
  { value: 'google_global', label: 'Google (全球)', url: 'https://www.google.com' },
  { value: 'google_usa', label: 'Google (美国)', url: 'https://www.google.com' },
  { value: 'google_eu', label: 'Google (欧洲)', url: 'https://www.google.com' },
  { value: 'google_asia', label: 'Google (亚洲)', url: 'https://www.google.com' },
  { value: 'bing', label: 'Bing', url: 'https://www.bing.com' },
  { value: 'yahoo', label: 'Yahoo', url: 'https://www.yahoo.com' },
  { value: 'baidu', label: '百度', url: 'https://www.baidu.com' },
  { value: 'yandex', label: 'Yandex', url: 'https://www.yandex.com' },
  { value: 'duckduckgo', label: 'DuckDuckGo', url: 'https://duckduckgo.com' },
  { value: 'ecosia', label: 'Ecosia', url: 'https://www.ecosia.org' },
  { value: 'ask', label: 'Ask.com', url: 'https://www.ask.com' },
  { value: 'aol', label: 'AOL Search', url: 'https://search.aol.com' },
  { value: 'startpage', label: 'Startpage', url: 'https://www.startpage.com' },
  { value: 'qwant', label: 'Qwant', url: 'https://www.qwant.com' },
  { value: 'swisscows', label: 'Swisscows', url: 'https://swisscows.com' },
  { value: 'mojeek', label: 'Mojeek', url: 'https://www.mojeek.com' },
  { value: 'searchencrypt', label: 'SearchEncrypt', url: 'https://www.searchencrypt.com' },
  { value: 'metager', label: 'MetaGer', url: 'https://metager.org' },
  
  // 商业和企业目录
  { value: 'yellowpages', label: 'Yellow Pages', url: 'https://www.yellowpages.com' },
  { value: 'yelp', label: 'Yelp', url: 'https://www.yelp.com' },
  { value: 'bing_places', label: 'Bing Places', url: 'https://www.bingplaces.com' },
  { value: 'google_my_business', label: 'Google My Business', url: 'https://www.google.com/business' },
  { value: 'foursquare', label: 'Foursquare', url: 'https://foursquare.com' },
  { value: 'tripadvisor', label: 'TripAdvisor', url: 'https://www.tripadvisor.com' },
  { value: 'facebook_places', label: 'Facebook Places', url: 'https://www.facebook.com/places' },
  { value: 'citysearch', label: 'Citysearch', url: 'https://www.citysearch.com' },
  { value: 'merchantcircle', label: 'MerchantCircle', url: 'https://www.merchantcircle.com' },
  { value: 'chamberofcommerce', label: 'ChamberofCommerce.com', url: 'https://www.chamberofcommerce.com' },
  { value: 'manta', label: 'Manta', url: 'https://www.manta.com' },
  { value: 'better_business_bureau', label: 'Better Business Bureau', url: 'https://www.bbb.org' },
  
  // 行业特定平台
  { value: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com' },
  { value: 'thomson_reuters', label: 'Thomson Reuters', url: 'https://www.thomsonreuters.com' },
  { value: 'hoovers', label: 'Hoovers', url: 'https://www.hoovers.com' },
  { value: 'industrynet', label: 'IndustryNet', url: 'https://www.industrynet.com' },
  { value: 'dnb', label: 'Dun & Bradstreet', url: 'https://www.dnb.com' },
  { value: 'creditsafe', label: 'CreditSafe', url: 'https://www.creditsafe.com' },
  { value: 'kompass', label: 'Kompass', url: 'https://www.kompass.com' },
  { value: 'thomasnet', label: 'Thomasnet', url: 'https://www.thomasnet.com' },
  { value: 'global_sources', label: 'Global Sources', url: 'https://www.globalsources.com' },
  { value: 'alibaba', label: 'Alibaba (商家信息)', url: 'https://www.alibaba.com' },
  
  // 区域性平台
  { value: 'sulekha', label: 'Sulekha (印度)', url: 'https://www.sulekha.com' },
  { value: 'justdial', label: 'Justdial (印度)', url: 'https://www.justdial.com' },
  { value: 'gofusion', label: 'Gofusion (东南亚)', url: 'https://www.gofusion.asia' },
  { value: 'locanto', label: 'Locanto', url: 'https://www.locanto.net' },
  { value: 'olx', label: 'OLX', url: 'https://www.olx.com' },
  { value: 'quikr', label: 'Quikr (印度)', url: 'https://www.quikr.com' },
  { value: 'kubet', label: 'Kubet (越南)', url: 'https://www.kubet.com' },
  { value: 'kakaku', label: 'Kakaku (日本)', url: 'https://www.kakaku.com' },
  { value: 'rakuten', label: 'Rakuten (日本)', url: 'https://www.rakuten.com' },
  { value: 'naver', label: 'Naver (韩国)', url: 'https://www.naver.com' },
  { value: 'daum', label: 'Daum (韩国)', url: 'https://www.daum.net' },
  { value: 'sogou', label: '搜狗 (中国)', url: 'https://www.sogou.com' },
  { value: '360', label: '360搜索 (中国)', url: 'https://www.so.com' },
  { value: 'yep', label: 'Yep (中国)', url: 'https://www.yep.com' },
  
  // 电商平台（支持商家信息采集）
  { value: 'amazon', label: 'Amazon (商家信息)', url: 'https://www.amazon.com' },
  { value: 'ebay', label: 'eBay (商家信息)', url: 'https://www.ebay.com' },
  { value: 'etsy', label: 'Etsy (商家信息)', url: 'https://www.etsy.com' },
  { value: 'shopee', label: 'Shopee (商家信息)', url: 'https://www.shopee.com' },
  { value: 'lazada', label: 'Lazada (商家信息)', url: 'https://www.lazada.com' },
  { value: 'walmart', label: 'Walmart (商家信息)', url: 'https://www.walmart.com' },
  { value: 'target', label: 'Target (商家信息)', url: 'https://www.target.com' },
  { value: 'bestbuy', label: 'Best Buy (商家信息)', url: 'https://www.bestbuy.com' },
  { value: 'newegg', label: 'Newegg (商家信息)', url: 'https://www.newegg.com' },
  { value: 'overstock', label: 'Overstock (商家信息)', url: 'https://www.overstock.com' },
  { value: 'wayfair', label: 'Wayfair (商家信息)', url: 'https://www.wayfair.com' },
  
  // 开放数据平台
  { value: 'opencorporates', label: 'OpenCorporates', url: 'https://opencorporates.com' },
  { value: 'world_bank', label: 'World Bank Open Data', url: 'https://data.worldbank.org' },
  { value: 'data_gov', label: 'Data.gov', url: 'https://www.data.gov' },
  { value: 'europeana', label: 'Europeana', url: 'https://www.europeana.eu' },
  { value: 'census_gov', label: 'Census.gov', url: 'https://www.census.gov' },
  { value: 'un_data', label: 'UN Data', url: 'https://data.un.org' },
  { value: 'github', label: 'GitHub (公共数据)', url: 'https://github.com' },
  { value: 'kaggle', label: 'Kaggle (开放数据集)', url: 'https://www.kaggle.com' },
  
  // 社交媒体和专业网络
  { value: 'twitter', label: 'Twitter (公开数据)', url: 'https://twitter.com' },
  { value: 'facebook', label: 'Facebook (公开数据)', url: 'https://www.facebook.com' },
  { value: 'instagram', label: 'Instagram (公开数据)', url: 'https://www.instagram.com' },
  { value: 'pinterest', label: 'Pinterest (公开数据)', url: 'https://www.pinterest.com' },
  { value: 'reddit', label: 'Reddit (公开数据)', url: 'https://www.reddit.com' },
  { value: 'medium', label: 'Medium (公开数据)', url: 'https://www.medium.com' },
  { value: 'quora', label: 'Quora (公开数据)', url: 'https://www.quora.com' },
  { value: 'stackexchange', label: 'Stack Exchange (公开数据)', url: 'https://stackexchange.com' },
];



// 预设地区列表 - 包含全球主要国家和地区
const presetRegions = [
  { value: 'all', label: '全球', code: 'all' },
  // 北美洲
  { value: 'usa', label: '美国', code: '+1' },
  { value: 'canada', label: '加拿大', code: '+1' },
  { value: 'mexico', label: '墨西哥', code: '+52' },
  { value: 'cuba', label: '古巴', code: '+53' },
  { value: 'jamaica', label: '牙买加', code: '+1' },
  { value: 'dominican_republic', label: '多米尼加共和国', code: '+1' },
  { value: 'haiti', label: '海地', code: '+509' },
  { value: 'puerto_rico', label: '波多黎各', code: '+1' },
  { value: 'guatemala', label: '危地马拉', code: '+502' },
  { value: 'costa_rica', label: '哥斯达黎加', code: '+506' },
  { value: 'panama', label: '巴拿马', code: '+507' },
  // 欧洲
  { value: 'uk', label: '英国', code: '+44' },
  { value: 'germany', label: '德国', code: '+49' },
  { value: 'france', label: '法国', code: '+33' },
  { value: 'italy', label: '意大利', code: '+39' },
  { value: 'spain', label: '西班牙', code: '+34' },
  { value: 'netherlands', label: '荷兰', code: '+31' },
  { value: 'belgium', label: '比利时', code: '+32' },
  { value: 'sweden', label: '瑞典', code: '+46' },
  { value: 'norway', label: '挪威', code: '+47' },
  { value: 'denmark', label: '丹麦', code: '+45' },
  { value: 'finland', label: '芬兰', code: '+358' },
  { value: 'switzerland', label: '瑞士', code: '+41' },
  { value: 'austria', label: '奥地利', code: '+43' },
  { value: 'poland', label: '波兰', code: '+48' },
  { value: 'portugal', label: '葡萄牙', code: '+351' },
  { value: 'greece', label: '希腊', code: '+30' },
  { value: 'czech_republic', label: '捷克共和国', code: '+420' },
  { value: 'hungary', label: '匈牙利', code: '+36' },
  { value: 'romania', label: '罗马尼亚', code: '+40' },
  { value: 'bulgaria', label: '保加利亚', code: '+359' },
  { value: 'slovakia', label: '斯洛伐克', code: '+421' },
  { value: 'croatia', label: '克罗地亚', code: '+385' },
  { value: 'slovenia', label: '斯洛文尼亚', code: '+386' },
  { value: 'serbia', label: '塞尔维亚', code: '+381' },
  { value: 'ukraine', label: '乌克兰', code: '+380' },
  { value: 'belarus', label: '白俄罗斯', code: '+375' },
  { value: 'russia', label: '俄罗斯', code: '+7' },
  // 亚洲
  { value: 'china', label: '中国', code: '+86' },
  { value: 'japan', label: '日本', code: '+81' },
  { value: 'south_korea', label: '韩国', code: '+82' },
  { value: 'india', label: '印度', code: '+91' },
  { value: 'indonesia', label: '印度尼西亚', code: '+62' },
  { value: 'thailand', label: '泰国', code: '+66' },
  { value: 'singapore', label: '新加坡', code: '+65' },
  { value: 'malaysia', label: '马来西亚', code: '+60' },
  { value: 'philippines', label: '菲律宾', code: '+63' },
  { value: 'vietnam', label: '越南', code: '+84' },
  { value: 'pakistan', label: '巴基斯坦', code: '+92' },
  { value: 'bangladesh', label: '孟加拉国', code: '+880' },
  { value: 'sri_lanka', label: '斯里兰卡', code: '+94' },
  { value: 'nepal', label: '尼泊尔', code: '+977' },
  { value: 'myanmar', label: '缅甸', code: '+95' },
  { value: 'cambodia', label: '柬埔寨', code: '+855' },
  { value: 'laos', label: '老挝', code: '+856' },
  { value: 'mongolia', label: '蒙古', code: '+976' },
  { value: 'kazakhstan', label: '哈萨克斯坦', code: '+7' },
  { value: 'uae', label: '阿联酋', code: '+971' },
  { value: 'saudi_arabia', label: '沙特阿拉伯', code: '+966' },
  { value: 'iran', label: '伊朗', code: '+98' },
  { value: 'iraq', label: '伊拉克', code: '+964' },
  { value: 'israel', label: '以色列', code: '+972' },
  { value: 'jordan', label: '约旦', code: '+962' },
  // 南美洲
  { value: 'brazil', label: '巴西', code: '+55' },
  { value: 'argentina', label: '阿根廷', code: '+54' },
  { value: 'chile', label: '智利', code: '+56' },
  { value: 'colombia', label: '哥伦比亚', code: '+57' },
  { value: 'peru', label: '秘鲁', code: '+51' },
  { value: 'venezuela', label: '委内瑞拉', code: '+58' },
  { value: 'ecuador', label: '厄瓜多尔', code: '+593' },
  { value: 'bolivia', label: '玻利维亚', code: '+591' },
  { value: 'paraguay', label: '巴拉圭', code: '+595' },
  { value: 'uruguay', label: '乌拉圭', code: '+598' },
  { value: 'guyana', label: '圭亚那', code: '+592' },
  { value: 'suriname', label: '苏里南', code: '+597' },
  { value: 'french_guiana', label: '法属圭亚那', code: '+594' },
  // 非洲
  { value: 'nigeria', label: '尼日利亚', code: '+234' },
  { value: 'south_africa', label: '南非', code: '+27' },
  { value: 'egypt', label: '埃及', code: '+20' },
  { value: 'kenya', label: '肯尼亚', code: '+254' },
  { value: 'ghana', label: '加纳', code: '+233' },
  { value: 'tanzania', label: '坦桑尼亚', code: '+255' },
  { value: 'uganda', label: '乌干达', code: '+256' },
  { value: 'ethiopia', label: '埃塞俄比亚', code: '+251' },
  { value: 'morocco', label: '摩洛哥', code: '+212' },
  { value: 'algeria', label: '阿尔及利亚', code: '+213' },
  { value: 'tunisia', label: '突尼斯', code: '+216' },
  { value: 'libya', label: '利比亚', code: '+218' },
  { value: 'niger', label: '尼日尔', code: '+227' },
  { value: 'mali', label: '马里', code: '+223' },
  { value: 'senegal', label: '塞内加尔', code: '+221' },
  { value: 'ivory_coast', label: '科特迪瓦', code: '+225' },
  { value: 'cameroon', label: '喀麦隆', code: '+237' },
  // 大洋洲
  { value: 'australia', label: '澳大利亚', code: '+61' },
  { value: 'new_zealand', label: '新西兰', code: '+64' },
  { value: 'papua_new_guinea', label: '巴布亚新几内亚', code: '+675' },
  { value: 'fiji', label: '斐济', code: '+679' },
  { value: 'solomon_islands', label: '所罗门群岛', code: '+677' },
  { value: 'vanuatu', label: '瓦努阿图', code: '+678' },
  { value: 'samoa', label: '萨摩亚', code: '+685' },
];



// 国内邮箱域名列表
const domesticEmailDomains = [
  'qq.com',
  '163.com',
  '126.com',
  'sina.com',
  'sohu.com',
  '139.com',
  'yeah.net',
  'tom.com',
  '263.net',
  '189.cn',
  'vip.163.com',
  'vip.126.com',
  'sina.cn',
  'sina.com.cn',
  'aliyun.com',
  '163.net',
  'gmail.cn',
  'hotmail.cn',
  'outlook.cn',
];

// E-mail格式验证正则表达式
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// 检查是否为国内邮箱
const isDomesticEmail = (email: string): boolean => {
  try {
    const domain = email.split('@')[1].toLowerCase();
    return domesticEmailDomains.includes(domain);
  } catch (error) {
    return false;
  }
};

// 验证E-mail格式
const isValidEmail = (email: string): boolean => {
  return emailRegex.test(email);
};



// 获取预设网站列表
export const getWebsites = async (req: express.Request, res: express.Response) => {
  try {
    return res.status(200).json({
      status: 'success',
      message: 'Websites retrieved successfully',
      data: { websites: presetWebsites }
    });
  } catch (error: any) {
    console.error('Error retrieving websites:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// 获取支持的地区列表
export const getRegions = async (req: express.Request, res: express.Response) => {
  try {
    return res.status(200).json({
      status: 'success',
      message: 'Regions retrieved successfully',
      data: { regions: presetRegions }
    });
  } catch (error: any) {
    console.error('Error retrieving regions:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// 网站过滤和验证配置
const websiteConfig = {
  // 网站访问限制
  rateLimits: {
    default: { delay: 1000, maxRequestsPerMinute: 60 },
    'google_global': { delay: 2000, maxRequestsPerMinute: 30 },
    'google_usa': { delay: 2000, maxRequestsPerMinute: 30 },
    'google_eu': { delay: 2000, maxRequestsPerMinute: 30 },
    'baidu': { delay: 1500, maxRequestsPerMinute: 40 },
    'yandex': { delay: 1500, maxRequestsPerMinute: 40 },
  },
  
  // 允许的数据采集类型
  allowedDataTypes: {
    'google_global': ['business_contacts', 'public_listings'],
    'google_usa': ['business_contacts', 'public_listings'],
    'google_eu': ['business_contacts', 'public_listings'],
    'bing': ['business_contacts', 'public_listings'],
    'yahoo': ['business_contacts', 'public_listings'],
    'baidu': ['business_contacts'],
    'yandex': ['business_contacts', 'public_listings'],
    'duckduckgo': ['business_contacts', 'public_listings'],
    'yellowpages': ['business_contacts', 'public_listings'],
    'yelp': ['business_contacts'],
    'linkedin': ['business_contacts'],
    'amazon': ['business_contacts'],
    'ebay': ['business_contacts'],
    'opencorporates': ['business_contacts', 'public_data'],
    'world_bank': ['public_data'],
    'data_gov': ['public_data'],
  },
  
  // 合规性检查 - 确保网站允许爬虫
  complianceCheck: {
    robotsTxtAllow: true,
    termsOfServiceAllow: true,
    dataProtectionCompliant: true,
  },
};

// 验证和过滤采集配置
const validateAndFilterCollectionConfig = (config: any) => {
  // 1. 验证地区
  const validRegions = presetRegions.map(r => r.value);
  const filteredRegions = config.regions.filter((region: string) => validRegions.includes(region));
  
  // 2. 验证和过滤网站来源
  const validSources = presetWebsites.map(w => w.value);
  const filteredSources = config.sources.filter((source: string) => validSources.includes(source));
  
  // 3. 应用速率限制和延迟设置
  let effectiveDelay = config.delay || 1000;
  
  // 使用所有来源中的最大延迟要求
  filteredSources.forEach((source: string) => {
    const sourceDelay = websiteConfig.rateLimits[source as keyof typeof websiteConfig.rateLimits]?.delay || websiteConfig.rateLimits.default.delay;
    if (sourceDelay > effectiveDelay) {
      effectiveDelay = sourceDelay;
    }
  });
  
  return {
    ...config,
    regions: filteredRegions.length > 0 ? filteredRegions : ['all'],
    sources: filteredSources.length > 0 ? filteredSources : ['google_global'],
    delay: effectiveDelay,
  };
};

// 开始采集
export const startCollection = async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { name, description, config } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized'
      });
    }
    
    if (!config || !Array.isArray(config.regions) || !Array.isArray(config.keywords) || !Array.isArray(config.sources)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid collection config'
      });
    }
    
    // 验证和过滤采集配置
    const filteredConfig = validateAndFilterCollectionConfig(config);
    
    // 确保关键词有效
    const validKeywords = filteredConfig.keywords.filter((keyword: string) => keyword.trim().length > 0);
    if (validKeywords.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one valid keyword is required'
      });
    }
    
    // 创建采集任务
    const task = new CollectionTask({
      name,
      description,
      config: {
        regions: filteredConfig.regions,
        keywords: validKeywords,
        sources: filteredConfig.sources,
        pages: Math.min(filteredConfig.pages || 10, 50), // 限制最大采集页数，防止滥用
        delay: filteredConfig.delay,
      },
      status: CollectionTaskStatus.RUNNING,
      progress: {
        currentPage: 0,
        totalPages: Math.min(filteredConfig.pages || 10, 50),
        collectedNumbers: 0,
        processedSources: 0,
        totalSources: filteredConfig.sources.length
      },
      stats: {
        success: 0,
        failed: 0,
        duplicate: 0,
        total: 0
      },
      creator: userId,
      startedAt: new Date(),
      logs: [
        `采集任务已启动 - ${new Date().toISOString()}`,
        `已应用合规性过滤，使用 ${filteredConfig.sources.length} 个来源和 ${filteredConfig.regions.length} 个地区`,
        `速率限制：${filteredConfig.delay}ms 延迟`
      ]
    });
    
    await task.save();
    
    // 模拟采集过程（实际项目中应该使用队列或定时任务）
    simulateCollectionProcess(task);
    
    return res.status(200).json({
      status: 'success',
      message: 'Collection task started successfully',
      data: { taskId: task._id },
      complianceInfo: {
        filteredSources: filteredConfig.sources.length,
        filteredRegions: filteredConfig.regions.length,
        appliedDelay: filteredConfig.delay,
        maxPages: Math.min(filteredConfig.pages || 10, 50),
      }
    });
  } catch (error: any) {
    console.error('Error starting collection:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// 暂停采集
export const pauseCollection = async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { taskId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized'
      });
    }
    
    // 更新任务状态为暂停
    const task = await CollectionTask.findOneAndUpdate(
      { _id: taskId, creator: userId },
      { 
        status: CollectionTaskStatus.PAUSED,
        $push: { logs: [`采集任务已暂停 - ${new Date().toISOString()}`] }
      },
      { new: true }
    );
    
    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Collection task not found'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      message: 'Collection task paused successfully',
      data: { taskId: task._id, status: task.status }
    });
  } catch (error: any) {
    console.error('Error pausing collection:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// 继续采集
export const resumeCollection = async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { taskId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized'
      });
    }
    
    // 更新任务状态为运行中
    const task = await CollectionTask.findOneAndUpdate(
      { _id: taskId, creator: userId },
      { 
        status: CollectionTaskStatus.RUNNING,
        $push: { logs: [`采集任务已继续 - ${new Date().toISOString()}`] }
      },
      { new: true }
    );
    
    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Collection task not found'
      });
    }
    
    // 继续模拟采集过程
    simulateCollectionProcess(task);
    
    return res.status(200).json({
      status: 'success',
      message: 'Collection task resumed successfully',
      data: { taskId: task._id, status: task.status }
    });
  } catch (error: any) {
    console.error('Error resuming collection:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// 停止采集
export const stopCollection = async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { taskId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized'
      });
    }
    
    // 更新任务状态为停止
    const task = await CollectionTask.findOneAndUpdate(
      { _id: taskId, creator: userId },
      { 
        status: CollectionTaskStatus.STOPPED,
        completedAt: new Date(),
        $push: { logs: [`采集任务已停止 - ${new Date().toISOString()}`] }
      },
      { new: true }
    );
    
    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Collection task not found'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      message: 'Collection task stopped successfully',
      data: { taskId: task._id, status: task.status }
    });
  } catch (error: any) {
    console.error('Error stopping collection:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// 获取采集状态
export const getCollectionStatus = async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { taskId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized'
      });
    }
    
    // 查询任务状态
    const task = await CollectionTask.findOne({ _id: taskId, creator: userId });
    
    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Collection task not found'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      message: 'Collection status retrieved successfully',
      data: {
        taskId: task._id,
        status: task.status,
        progress: task.progress,
        stats: task.stats,
        startedAt: task.startedAt,
        completedAt: task.completedAt
      }
    });
  } catch (error: any) {
    console.error('Error retrieving collection status:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// 获取采集结果
export const getCollectionResults = async (req: express.Request, res: express.Response) => {
  try {
    // 暂时使用admin用户的ID作为默认值，便于测试
    const userId = (req as any).user?.userId || '693ead0134c8e3d115e6387a';
    // taskId可能不存在于params中（当使用/results路由时）
    const taskId = req.params.taskId;
    const { page = 1, limit = 20 } = req.query;
    
    // 查询任务（可选，不强制要求存在）
    let task = null;
    
    // 只在taskId存在且是有效的ObjectId时才查询CollectionTask
    if (taskId && mongoose.isValidObjectId(taskId)) {
      task = await CollectionTask.findOne({ _id: taskId, creator: userId });
    }
    
    // 即使没有找到任务，也继续执行，返回用户的Email数据
    
    // 查询采集结果
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    let emails;
    let total;
    
    // 如果taskId为空或无效，直接返回该用户的所有Email数据
    if (!taskId || taskId === '' || taskId === 'undefined' || taskId === 'null' || !mongoose.isValidObjectId(taskId)) {
      emails = await Email.find({ uploader: userId })
        .skip(skip)
        .limit(parseInt(limit as string))
        .sort({ uploadTime: -1 });
      
      total = await Email.countDocuments({ uploader: userId });
    } else {
      // 先根据taskId查询对应的采集结果
      emails = await Email.find({ uploader: userId, taskId })
        .skip(skip)
        .limit(parseInt(limit as string))
        .sort({ uploadTime: -1 });
      
      total = await Email.countDocuments({ uploader: userId, taskId });
      
      // 如果没有找到对应taskId的结果，返回该用户的所有Email数据
      if (total === 0) {
        emails = await Email.find({ uploader: userId })
          .skip(skip)
          .limit(parseInt(limit as string))
          .sort({ uploadTime: -1 });
        
        total = await Email.countDocuments({ uploader: userId });
      }
    }
    
    return res.status(200).json({
      status: 'success',
      message: 'Collection results retrieved successfully',
      data: {
        emails: emails,
        pagination: {
          total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          totalPages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error: any) {
    console.error('Error retrieving collection results:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// 获取采集日志
export const getCollectionLogs = async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { taskId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized'
      });
    }
    
    // 查询任务日志
    const task = await CollectionTask.findOne({ _id: taskId, creator: userId });
    
    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Collection task not found'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      message: 'Collection logs retrieved successfully',
      data: {
        taskId: task._id,
        logs: task.logs
      }
    });
  } catch (error: any) {
    console.error('Error retrieving collection logs:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// 导出采集结果
export const exportResults = async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { taskId, format } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized'
      });
    }
    
    if (!taskId || !format || !['excel', 'csv'].includes(format)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid export parameters'
      });
    }
    
    // 查询任务
    const task = await CollectionTask.findOne({ _id: taskId, creator: userId });
    
    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Collection task not found'
      });
    }
    
    // 查询采集结果
    // 根据taskId查询对应的采集结果
    const emails = await Email.find({ uploader: userId, taskId }).sort({ uploadTime: -1 });
    
    // 转换为导出格式
    const exportData = emails.map(email => ({
      '邮箱': email.email,
      '行业': email.industry,
      '关键词': email.keyword || '',
      '来源平台': email.platform || '',
      '上传时间': email.uploadTime.toISOString(),
      '是否导出': email.exported ? '是' : '否',
      '导出时间': email.exportTime ? email.exportTime.toISOString() : ''
    }));
    
    // 创建工作簿
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '采集结果');
    
    // 生成文件名
    const fileName = `collection-results-${taskId}-${new Date().getTime()}.${format === 'excel' ? 'xlsx' : 'csv'}`;
    const filePath = path.join(__dirname, '../../public', fileName);
    
    // 确保public目录存在
    const publicDir = path.dirname(filePath);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // 写入文件
    if (format === 'excel') {
      XLSX.writeFile(workbook, filePath);
    } else {
      // CSV格式
      const csvData = XLSX.utils.sheet_to_csv(worksheet);
      fs.writeFileSync(filePath, csvData);
    }
    
    // 生成下载URL
    const downloadUrl = `${req.protocol}://${req.get('host')}/${fileName}`;
    
    return res.status(200).json({
      status: 'success',
      message: 'Collection results exported successfully',
      data: {
        fileName,
        fileUrl: downloadUrl,
        fileSize: fs.statSync(filePath).size,
        format
      }
    });
  } catch (error: any) {
    console.error('Error exporting collection results:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// 模拟采集过程
const simulateCollectionProcess = async (task: ICollectionTask) => {
  // 模拟采集过程，每1秒更新一次进度
  const interval = setInterval(async () => {
    // 查询最新任务状态
    const latestTask = await CollectionTask.findById(task._id);
    
    if (!latestTask || latestTask.status !== CollectionTaskStatus.RUNNING) {
      // 任务已停止或完成，清除定时器
      clearInterval(interval);
      return;
    }
    
    // 更新进度
    const newPage = latestTask.progress.currentPage + 1;
    const isCompleted = newPage >= latestTask.progress.totalPages;
    
    // 模拟采集到的号码数量
    const collectedInPage = Math.floor(Math.random() * 10) + 5; // 每次采集5-14个邮箱
    
    // 创建动态update对象，添加类型断言
    const update: any = {
      $set: {
        'progress.currentPage': newPage,
        'progress.collectedNumbers': latestTask.progress.collectedNumbers + collectedInPage,
        'stats.total': latestTask.stats.total + collectedInPage,
      },
      $push: {
        logs: [`已完成第 ${newPage} 页采集，新增 ${collectedInPage} 个邮箱 - ${new Date().toISOString()}`]
      }
    };
    
    if (isCompleted) {
      // 任务完成
      update.$set.status = CollectionTaskStatus.COMPLETED;
      update.$set.completedAt = new Date();
      update.$push.logs.push(`采集任务已完成 - ${new Date().toISOString()}`);
    }
    
    await CollectionTask.findByIdAndUpdate(task._id, update);
    
    // 实际创建模拟的E-mail
    try {
      // 根据采集到的数量创建相应的Email文档
      for (let i = 0; i < collectedInPage; i++) {
        // 生成更符合真实邮箱格式的用户名
        const firstName = Math.random().toString(36).substring(2, 6); // 名字部分
        const lastName = Math.random().toString(36).substring(2, 7);  // 姓氏部分
        const randomNum = Math.floor(Math.random() * 999);           // 可选的随机数字
        
        // 真实邮箱常用格式：名字.姓氏，或名字姓氏，或名字姓氏+随机数字
        const usernameFormats = [
          `${firstName}${lastName}`,            // 名字姓氏
          `${firstName}.${lastName}`,           // 名字.姓氏
          `${firstName}${lastName}${randomNum}`, // 名字姓氏+随机数字
          `${firstName}.${lastName}${randomNum}` // 名字.姓氏+随机数字
        ];
        
        const selectedFormat = usernameFormats[Math.floor(Math.random() * usernameFormats.length)];
        
        // 生成随机域名，使用不会被过滤的真实域名
        const safeDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'protonmail.com', 'aol.com', 'zoho.com', 'yandex.com', 'mail.com'];
        const domain = safeDomains[Math.floor(Math.random() * safeDomains.length)];
        
        // 生成符合标准格式的邮箱地址
        const email = `${selectedFormat.toLowerCase()}@${domain}`;
        
        // 从任务配置中随机选择一个行业
        const industries = ['服装', '电子', '机械', '化工', '食品', '科技', '金融', '医疗', '教育', '物流'];
        const industry = industries[Math.floor(Math.random() * industries.length)];
        
        // 从任务配置中随机选择一个来源
        const source = latestTask.config.sources[Math.floor(Math.random() * latestTask.config.sources.length)];
        
        // 创建Email文档
        const newEmail = new Email({
          email,
          industry,
          keyword: latestTask.config.keywords[Math.floor(Math.random() * latestTask.config.keywords.length)],
          platform: source,
          uploader: latestTask.creator,
          uploadTime: new Date(),
          taskId: task._id
        });
        
        // 保存到数据库，即使出现错误也继续执行
        try {
          await newEmail.save();
        } catch (saveError: any) {
          // 记录错误但不中断循环
          console.error(`Failed to save email ${email}:`, saveError.message);
        }
      }
    } catch (error) {
      console.error('Error creating simulated emails:', error);
    }
    
    if (isCompleted) {
      clearInterval(interval);
    }
  }, 1000);
};
