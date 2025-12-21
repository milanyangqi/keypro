# 科浦诺外贸管理系统

## 项目介绍
科浦诺外贸管理系统是一个集WhatsApp号码管理和邮箱地址管理于一体的外贸客户资源管理系统，支持号码/邮箱上传、匹配、查询、筛选等功能。

## 功能特点

### WhatsApp号码管理
1. 支持粘贴WhatsApp号码（一行一个）
2. 支持上传表格或文本文件（提供模板下载）
3. 号码所属行业选择和手动输入
4. 号码存储和匹配功能
5. 按日期、行业、国家、上传者等多维度查询和统计功能
6. 表格列筛选功能（行业、国家、关键词、语法、平台、上传者）
7. 自定义平台输入功能
8. 批量删除功能

### 邮箱地址管理
1. 支持粘贴邮箱地址（一行一个或用逗号分隔）
2. 支持上传表格或文本文件（提供模板下载）
3. 邮箱所属行业选择和手动输入
4. 邮箱存储和匹配功能
5. 按日期、行业、上传者等多维度查询和统计功能
6. 表格列筛选功能（行业、关键词、语法、平台、上传者）
7. 自定义平台输入功能
8. 批量删除功能

### 系统功能
1. 用户注册登录系统
2. 管理员权限管理
3. Docker一键部署
4. 支持自定义平台输入
5. 默认显示所有数据
6. 增强的表格筛选功能

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

#### 1. 一键部署
```bash
./start.sh docker-deploy
```

#### 2. 访问系统
打开浏览器访问：http://localhost

## 初始账号
- 管理员账号：admin
- 管理员密码：admin123

## 项目结构
```
keypro_trade_1.0/
├── backend/          # 后端代码
├── frontend/         # 前端代码
├── docker-compose.yml # Docker Compose配置
├── start.sh          # 启动脚本
├── mongodb-init.js   # MongoDB初始化脚本
└── README.md         # 项目说明文档
```

## 版本历史
- v1.0：初始版本，支持基本的WhatsApp号码管理功能
- v1.1：增加邮箱地址管理功能
- v1.2：优化查询功能和筛选功能
- v1.3：增强表格筛选功能，支持国家和上传者筛选，默认显示所有数据

