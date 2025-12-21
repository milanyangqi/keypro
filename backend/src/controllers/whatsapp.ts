import express from 'express';
import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import WhatsAppNumber from '../models/WhatsAppNumber';

// 解析文件中的号码
const parseNumbersFromFile = (filePath: string, fileExt: string): string[] => {
  let numbers: string[] = [];
  
  try {
    if (fileExt === '.txt' || fileExt === '.csv') {
      // 读取文本文件
      const content = fs.readFileSync(filePath, 'utf8');
      numbers = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    } else if (fileExt === '.xlsx' || fileExt === '.xls') {
      // 读取Excel文件
      const workbook = XLSX.readFile(filePath);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      // 假设第一列是号码
      numbers = data.map((row: any) => {
        const values = Object.values(row);
        return values[0] ? String(values[0]).trim() : '';
      }).filter(number => number.length > 0);
    }
  } catch (error) {
    console.error('Error parsing file:', error);
    throw new Error('Failed to parse file');
  }
  
  return numbers;
};

// 上传WhatsApp号码控制器
export const uploadNumbers = async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { industry, keyword, syntax, platform } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized'
      });
    }
    
    if (!industry || industry.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Industry is required'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'File is required'
      });
    }
    
    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    
    // 解析号码
    const numbers = parseNumbersFromFile(filePath, fileExt);
    
    if (numbers.length === 0) {
      // 删除临时文件
      fs.unlinkSync(filePath);
      
      return res.status(400).json({
        status: 'error',
        message: 'No valid numbers found in the file'
      });
    }
    
    console.log('Parsed numbers:', numbers);
    
    // 去重并清理
    const uniqueNumbers = [...new Set(numbers.map(n => n.trim()))];
    
    // 查询已存在的号码
    const existingNumbers = await WhatsAppNumber.find({
      number: { $in: uniqueNumbers }
    });
    
    console.log('Found existing numbers:', existingNumbers.length);
    
    // 提取已存在的号码
    const existingNumberSet = new Set(existingNumbers.map(n => n.number));
    
    // 分离已存在和新号码
    const matchedNumbers = existingNumbers;
    const unmatchedNumbers = uniqueNumbers.filter(n => !existingNumberSet.has(n));
    
    console.log('Unmatched numbers to save:', unmatchedNumbers.length);
    
    // 保存新号码到数据库
    const uploadTime = new Date();
    let savedNumbers: any[] = [];
    
    if (unmatchedNumbers.length > 0) {
      savedNumbers = await Promise.all(
        unmatchedNumbers.map(async (number) => {
          console.log('Saving number:', number);
          
          const whatsappNumber = new WhatsAppNumber({
            number,
            industry: industry.trim(),
            keyword: keyword?.trim(),
            syntax: syntax?.trim(),
            platform: platform?.trim(),
            uploader: userId,
            uploadTime
          });
          
          return await whatsappNumber.save();
        })
      );
    }
    
    console.log('Saved numbers:', savedNumbers.length);
    
    // 删除临时文件
    fs.unlinkSync(filePath);
    
    return res.status(200).json({
      status: 'success',
      message: 'Numbers uploaded successfully',
      data: {
        matched: matchedNumbers.length,
        matchedNumbers,
        saved: savedNumbers.length,
        savedNumbers
      }
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    // 清理临时文件
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error deleting temporary file:', err);
      }
    }
    
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// 匹配WhatsApp号码控制器
export const matchNumbers = async (req: express.Request, res: express.Response) => {
  try {
    const { numbers } = req.body;
    
    if (!Array.isArray(numbers) || numbers.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Numbers array is required'
      });
    }
    
    console.log('Matching numbers:', numbers);
    
    // 查询所有已存在的号码
    const allExistingNumbers = await WhatsAppNumber.find({});
    console.log('All existing numbers:', allExistingNumbers.length);
    
    // 去重并清理
    const uniqueNumbers = [...new Set(numbers.map(n => n.trim()))];
    
    // 查询已存在的号码
    const existingNumbers = await WhatsAppNumber.find({
      number: { $in: uniqueNumbers }
    });
    
    console.log('Found existing numbers:', existingNumbers.length);
    
    // 提取已存在的号码
    const existingNumberSet = new Set(existingNumbers.map(n => n.number));
    
    // 分离已存在和新号码
    const matched = existingNumbers;
    const unmatched = uniqueNumbers.filter(n => !existingNumberSet.has(n));
    
    return res.status(200).json({
      status: 'success',
      message: 'Number matching completed',
      data: {
        matched: {
          count: matched.length,
          numbers: matched
        },
        unmatched: {
          count: unmatched.length,
          numbers: unmatched
        }
      }
    });
  } catch (error: any) {
    console.error('Match error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// 查询WhatsApp号码控制器
export const getNumbers = async (req: express.Request, res: express.Response) => {
  try {
    const { date, startDate, endDate, industry, exported, page = 1, limit = 20 } = req.query;
    
    console.log('Query params:', req.query);
    
    const query: any = {};
    
    // 按导出状态查询
    if (exported !== undefined) {
      query.exported = exported === 'true';
    }
    
    // 按日期查询
    if (date) {
      // 处理单个日期查询，确保查询的是东八区（UTC+8）的完整24小时
      // 前端发送的是YYYY-MM-DD格式，需要转换为东八区时间的00:00:00到23:59:59
      // 然后转换为UTC时间存储到MongoDB
      const dateStr = date as string;
      
      // 解析为东八区时间（UTC+8）
      // 东八区比UTC早8小时，所以需要调整小时数
      const start = new Date(dateStr);
      start.setUTCHours(0, 0, 0, 0);
      start.setUTCHours(start.getUTCHours() - 8); // 调整为东八区00:00:00
      
      const end = new Date(dateStr);
      end.setUTCHours(23, 59, 59, 999);
      end.setUTCHours(end.getUTCHours() - 8); // 调整为东八区23:59:59.999
      
      query.uploadTime = {
        $gte: start,
        $lte: end
      };
    } else if (startDate || endDate) {
      // 按日期范围查询
      query.uploadTime = {};
      if (startDate) {
        // 前端发送的是YYYY-MM-DD格式，转换为东八区时间的00:00:00
        const dateStr = startDate as string;
        const start = new Date(dateStr);
        start.setUTCHours(0, 0, 0, 0);
        start.setUTCHours(start.getUTCHours() - 8); // 调整为东八区00:00:00
        query.uploadTime.$gte = start;
      }
      if (endDate) {
        // 前端发送的是YYYY-MM-DD格式，转换为东八区时间的23:59:59.999
        const dateStr = endDate as string;
        const end = new Date(dateStr);
        end.setUTCHours(23, 59, 59, 999);
        end.setUTCHours(end.getUTCHours() - 8); // 调整为东八区23:59:59.999
        query.uploadTime.$lte = end;
      }
    } else {
      // 默认查询所有数据
      console.log('No date filters, querying all data');
    }
    
    // 按行业查询
    if (industry) {
      query.industry = {
        $regex: industry as string,
        $options: 'i'
      };
    }
    
    console.log('Final query:', query);
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    // 查询号码
    const numbers = await WhatsAppNumber.find(query)
      .populate('uploader', 'username email')
      .skip(skip)
      .limit(parseInt(limit as string))
      .sort({ uploadTime: -1 });
    
    const total = await WhatsAppNumber.countDocuments(query);
    
    console.log('Query result:', numbers.length, 'total:', total);
    
    return res.status(200).json({
      status: 'success',
      message: 'Numbers retrieved successfully',
      data: {
        numbers,
        pagination: {
          total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          totalPages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error: any) {
    console.error('Query error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// 获取WhatsApp号码统计控制器
export const getNumberStats = async (req: express.Request, res: express.Response) => {
  try {
    const { date } = req.query;
    
    const query: any = {};
    
    // 按日期查询
    if (date) {
      const startDate = new Date(date as string);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date as string);
      endDate.setHours(23, 59, 59, 999);
      
      query.uploadTime = {
        $gte: startDate,
        $lte: endDate
      };
    }
    
    // 统计总数
    const total = await WhatsAppNumber.countDocuments(query);
    
    // 按行业统计
    const industryStats = await WhatsAppNumber.aggregate([
      { $match: query },
      { $group: { _id: '$industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // 按日期统计
    const dateStats = await WhatsAppNumber.aggregate([
      { $match: query },
      { 
        $group: { 
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$uploadTime' } },
          count: { $sum: 1 }
        } 
      },
      { $sort: { _id: 1 } }
    ]);
    
    return res.status(200).json({
      status: 'success',
      message: 'Stats retrieved successfully',
      data: {
        total,
        industryStats,
        dateStats
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// 下载模板文件控制器
export const downloadTemplate = (req: express.Request, res: express.Response) => {
  try {
    // 检查模板文件是否存在
    const templatePath = path.join(__dirname, '../../public/whatsapp-template.xlsx');
    
    // 如果模板文件不存在，创建一个
    if (!fs.existsSync(templatePath)) {
      // 创建工作簿
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet([
        { 'WhatsApp Number': '1234567890' },
        { 'WhatsApp Number': '9876543210' },
        { 'WhatsApp Number': '1112223333' }
      ]);
      
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Numbers');
      
      // 确保public目录存在
      const publicDir = path.dirname(templatePath);
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      
      // 写入模板文件
      XLSX.writeFile(workbook, templatePath);
    }
    
    // 下载模板文件
    res.download(templatePath, 'whatsapp-template.xlsx', (err) => {
      if (err) {
        console.error('Error downloading template:', err);
        res.status(500).json({
          status: 'error',
          message: 'Failed to download template'
        });
      }
    });
  } catch (error: any) {
    console.error('Error generating template:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate template'
    });
  }
};

// 删除单个WhatsApp号码控制器
export const deleteNumber = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    
    console.log('=== WhatsApp Delete Request ===');
    console.log('Request params:', req.params);
    console.log('Request path:', req.path);
    console.log('Request url:', req.url);
    console.log('Request method:', req.method);
    
    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'Number ID is required'
      });
    }
    
    console.log('Attempting to delete WhatsAppNumber with id:', id);
    console.log('Using WhatsAppNumber model:', WhatsAppNumber.modelName);
    
    const deletedNumber = await WhatsAppNumber.findByIdAndDelete(id);
    
    console.log('Deleted WhatsAppNumber result:', deletedNumber);
    
    if (!deletedNumber) {
      return res.status(404).json({
        status: 'error',
        message: 'Number not found'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      message: 'Number deleted successfully',
      data: deletedNumber
    });
  } catch (error: any) {
    console.error('Delete error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// 批量删除WhatsApp号码控制器
export const deleteNumbers = async (req: express.Request, res: express.Response) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'IDs array is required and must not be empty'
      });
    }
    
    const result = await WhatsAppNumber.deleteMany({
      _id: { $in: ids }
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'Numbers deleted successfully',
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error: any) {
    console.error('Batch delete error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// 导出WhatsApp号码控制器
export const exportNumbers = async (req: express.Request, res: express.Response) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'IDs array is required and must not be empty'
      });
    }
    
    // 标记号码为已导出
    const exportTime = new Date();
    const result = await WhatsAppNumber.updateMany(
      { _id: { $in: ids } },
      { 
        exported: true, 
        exportTime 
      }
    );
    
    // 获取导出的号码详细信息
    const exportedNumbers = await WhatsAppNumber.find({
      _id: { $in: ids }
    }).populate('uploader', 'username email');
    
    return res.status(200).json({
      status: 'success',
      message: 'Numbers exported successfully',
      data: {
        exportedCount: result.modifiedCount,
        exportedNumbers
      }
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};