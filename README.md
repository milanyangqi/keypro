# 科浦诺外贸管理系统

## 项目介绍
科浦诺外贸管理系统是一个用于查询和管理WhatsApp号码的系统，支持号码上传、匹配、查询等功能。

## 功能特点
1. 支持粘贴WhatsApp号码（一行一个）
2. 支持上传表格或文本文件（提供模板下载）
3. 号码所属行业选择和手动输入
4. 号码存储和匹配功能
5. 按日期查询和统计功能
6. 用户注册登录系统
7. 管理员权限管理
8. Docker一键部署

## 技术栈
- 前端：React + TypeScript + Ant Design
- 后端：Node.js + Express + TypeScript
- 数据库：MongoDB + Mongoose
- 部署：Docker + Docker Compose

## 快速开始

### 本地开发

#### 1. 安装依赖
```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

#### 2. 启动MongoDB
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

#### 3. 启动后端服务
```bash
cd backend
npm run dev
```

#### 4. 启动前端服务
```bash
cd frontend
npm run dev
```

#### 5. 访问系统
打开浏览器访问：http://localhost:3000

### Docker部署

#### 1. 构建和启动服务
```bash
docker-compose up -d
```

#### 2. 访问系统
打开浏览器访问：http://localhost:3008

## 初始账号
- 管理员账号：admin
- 管理员密码：admin123

## 项目结构
```
keypro_trade_1.0/
├── backend/          # 后端代码
├── frontend/         # 前端代码
├── docker-compose.yml # Docker Compose配置
├── Dockerfile.backend # 后端Dockerfile
├── Dockerfile.frontend # 前端Dockerfile
└── README.md         # 项目说明文档
```
