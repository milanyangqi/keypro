FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制源代码
COPY . .

# 构建TypeScript
RUN npm run build

# 创建上传目录
RUN mkdir -p uploads public

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["npm", "start"]
