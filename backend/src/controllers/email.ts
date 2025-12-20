import express from 'express';
import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import Email from '../models/Email';

// 解析文件中的邮箱
const parseEmailsFromFile = (filePath: string, fileExt: string): string[] => {
  let emails: string[] = [];
  
  try {
    if (fileExt === '.txt' || fileExt === '.csv') {
      // 读取文本文件
      const content = fs.readFileSync(filePath, 'utf8');
      emails = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    } else if (fileExt === '.xlsx' || fileExt === '.xls') {
      // 读取Excel文件
      const workbook = XLSX.readFile(filePath);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      // 假设第一列是邮箱
      emails = data.map((row: any) => {
        const values = Object.values(row);
        return values[0] ? String(values[0]).trim() : '';
      }).filter(email => email.length > 0);
    }
  } catch (error) {
    console.error('Error parsing file:', error);
    throw new Error('Failed to parse file');
  }
  
  return emails;
};

// 上传邮箱控制器
export const uploadEmails = async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { industry } = req.body;
    
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
    
    // 解析邮箱
    const emails = parseEmailsFromFile(filePath, fileExt);
    
    if (emails.length === 0) {
      // 删除临时文件
      fs.unlinkSync(filePath);
      
      return res.status(400).json({
        status: 'error',
        message: 'No valid emails found in the file'
      });
    }
    
    console.log('Parsed emails:', emails);
    
    // 去重并清理
    const uniqueEmails = [...new Set(emails.map(n => n.trim()))];
    
    // 查询已存在的邮箱
    const existingEmails = await Email.find({
      email: { $in: uniqueEmails }
    });
    
    console.log('Found existing emails:', existingEmails.length);
    
    // 提取已存在的邮箱
    const existingEmailSet = new Set(existingEmails.map(n => n.email));
    
    // 分离已存在和新邮箱
    const matchedEmails = existingEmails;
    const unmatchedEmails = uniqueEmails.filter(n => !existingEmailSet.has(n));
    
    console.log('Unmatched emails to save:', unmatchedEmails.length);
    
    // 保存新邮箱到数据库
    const uploadTime = new Date();
    let savedEmails: any[] = [];
    
    if (unmatchedEmails.length > 0) {
      savedEmails = await Promise.all(
        unmatchedEmails.map(async (email) => {
          console.log('Saving email:', email);
          
          const emailDoc = new Email({
            email,
            industry: industry.trim(),
            uploader: userId,
            uploadTime
          });
          
          return await emailDoc.save();
        })
      );
    }
    
    console.log('Saved emails:', savedEmails.length);
    
    // 删除临时文件
    fs.unlinkSync(filePath);
    
    return res.status(200).json({
      status: 'success',
      message: 'Emails uploaded successfully',
      data: {
        matched: matchedEmails.length,
        matchedEmails,
        saved: savedEmails.length,
        savedEmails
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

// 匹配邮箱控制器
export const matchEmails = async (req: express.Request, res: express.Response) => {
  try {
    const { emails } = req.body;
    
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Emails array is required'
      });
    }
    
    console.log('Matching emails:', emails);
    
    // 去重并清理
    const uniqueEmails = [...new Set(emails.map(n => n.trim()))];
    
    // 查询已存在的邮箱
    const existingEmails = await Email.find({
      email: { $in: uniqueEmails }
    });
    
    console.log('Found existing emails:', existingEmails.length);
    
    // 提取已存在的邮箱
    const existingEmailSet = new Set(existingEmails.map(n => n.email));
    
    // 分离已存在和新邮箱
    const matched = existingEmails;
    const unmatched = uniqueEmails.filter(n => !existingEmailSet.has(n));
    
    return res.status(200).json({
      status: 'success',
      message: 'Email matching completed',
      data: {
        matched: {
          count: matched.length,
          emails: matched
        },
        unmatched: {
          count: unmatched.length,
          emails: unmatched
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

// 查询邮箱控制器
export const getEmails = async (req: express.Request, res: express.Response) => {
  try {
    const { date, startDate, endDate, industry, uploader, page = 1, limit = 20 } = req.query;
    
    console.log('Query params:', req.query);
    
    const query: any = {};
    
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
    
    // 按上传者查询
    if (uploader) {
      query.uploader = uploader as string;
    }
    
    console.log('Final query:', query);
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    // 查询邮箱
    const emails = await Email.find(query)
      .populate('uploader', 'username email')
      .skip(skip)
      .limit(parseInt(limit as string))
      .sort({ uploadTime: -1 });
    
    const total = await Email.countDocuments(query);
    
    console.log('Query result:', emails.length, 'total:', total);
    
    return res.status(200).json({
      status: 'success',
      message: 'Emails retrieved successfully',
      data: {
        emails,
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

// 获取邮箱统计控制器
export const getEmailStats = async (req: express.Request, res: express.Response) => {
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
    const total = await Email.countDocuments(query);
    
    // 按行业统计
    const industryStats = await Email.aggregate([
      { $match: query },
      { $group: { _id: '$industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // 按日期统计
    const dateStats = await Email.aggregate([
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
    const templatePath = path.join(__dirname, '../../public/email-template.xlsx');
    
    // 如果模板文件不存在，创建一个
    if (!fs.existsSync(templatePath)) {
      // 创建工作簿
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet([
        { 'Email': 'example1@example.com' },
        { 'Email': 'example2@example.com' },
        { 'Email': 'example3@example.com' }
      ]);
      
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Emails');
      
      // 确保public目录存在
      const publicDir = path.dirname(templatePath);
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      
      // 写入模板文件
      XLSX.writeFile(workbook, templatePath);
    }
    
    // 下载模板文件
    res.download(templatePath, 'email-template.xlsx', (err) => {
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

// 删除单个邮箱控制器
export const deleteEmail = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    
    console.log('=== Email Delete Request ===');
    console.log('Request params:', req.params);
    console.log('Request path:', req.path);
    console.log('Request url:', req.url);
    console.log('Request method:', req.method);
    
    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'Email ID is required'
      });
    }
    
    console.log('Attempting to delete Email with id:', id);
    console.log('Using Email model:', Email.modelName);
    
    const deletedEmail = await Email.findByIdAndDelete(id);
    
    console.log('Deleted Email result:', deletedEmail);
    
    if (!deletedEmail) {
      return res.status(404).json({
        status: 'error',
        message: 'Email not found'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      message: 'Email deleted successfully',
      data: deletedEmail
    });
  } catch (error: any) {
    console.error('Delete error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// 批量删除邮箱控制器
export const deleteEmails = async (req: express.Request, res: express.Response) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'IDs array is required and must not be empty'
      });
    }
    
    const result = await Email.deleteMany({
      _id: { $in: ids }
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'Emails deleted successfully',
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
