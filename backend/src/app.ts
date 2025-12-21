import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

// 加载环境变量
dotenv.config();

// 导入路由
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import whatsappRoutes from './routes/whatsapp';
import whatsappCollectionRoutes from './routes/whatsapp-collection';
import emailRoutes from './routes/email';
import emailCollectionRoutes from './routes/email-collection';

// 创建Express应用
const app = express();

// 配置中间件
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 配置静态文件
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 配置信任代理
app.set('trust proxy', 1);

// 配置速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP最多100个请求
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

// 配置路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/whatsapp-collection', whatsappCollectionRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/email-collection', emailCollectionRoutes);

// 健康检查路由
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// 404处理
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Not Found'
  });
});

// 初始化管理员用户
const initAdminUser = async () => {
  try {
    const User = require('./models/User').default;
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    // 检查管理员用户是否存在
    const existingAdmin = await User.findOne({ username: adminUsername });
    if (!existingAdmin) {
      // 创建管理员用户
      const admin = new User({
        username: adminUsername,
        email: 'admin@example.com',
        password: adminPassword,
        role: 'admin',
        status: 'active'
      });
      await admin.save();
      console.log('Admin user created successfully!');
    } else {
      console.log('Admin user already exists!');
    }
  } catch (error) {
    console.error('Error initializing admin user:', error);
  }
};

// 连接数据库
const connectDB = async (retryCount = 0, maxRetries = 5) => {
  try {
    // 添加MongoDB连接选项，提高连接稳定性
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/keypro_trade', {
      serverSelectionTimeoutMS: 5000, // 服务器选择超时
      socketTimeoutMS: 45000, // 套接字超时
      connectTimeoutMS: 10000, // 连接超时
      retryWrites: true, // 重试写入操作
      autoIndex: true, // 自动创建索引
      family: 4 // 使用IPv4
    });
    console.log('MongoDB connected successfully');
    
    // 初始化管理员用户
    await initAdminUser();
    
    // 添加数据库连接事件监听器
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected, attempting to reconnect...');
      connectDB();
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });
    
  } catch (error) {
    console.error(`MongoDB connection error (attempt ${retryCount + 1}/${maxRetries}):`, error);
    
    if (retryCount < maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 30000); // 指数退避策略
      console.log(`Retrying connection in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return connectDB(retryCount + 1, maxRetries);
    } else {
      console.error('Max MongoDB connection retries reached, exiting...');
      process.exit(1);
    }
  }
};

// 启动服务器
const PORT = process.env.PORT || 3001;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
