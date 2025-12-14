#!/bin/bash

# 科浦诺外贸管理系统启动脚本

echo "========================================"
echo "科浦诺外贸管理系统 (KeyPro Trade System)"
echo "版本: 1.0"
echo "========================================"
echo ""

# 检查是否安装了Node.js
check_node() {
    if ! command -v node &> /dev/null; then
        echo "❌ 错误: 未安装Node.js，请先安装Node.js 18+"
        exit 1
    fi
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
    if [ $NODE_MAJOR -lt 18 ]; then
        echo "❌ 错误: Node.js版本过低，请安装Node.js 18+"
        exit 1
    fi
    echo "✅ Node.js版本: $NODE_VERSION"
}

# 检查是否安装了npm
check_npm() {
    if ! command -v npm &> /dev/null; then
        echo "❌ 错误: 未安装npm，请先安装npm"
        exit 1
    fi
    NPM_VERSION=$(npm -v)
    echo "✅ npm版本: $NPM_VERSION"
}

# 检查是否安装了Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo "❌ 错误: 未安装Docker，请先安装Docker"
        exit 1
    fi
    DOCKER_VERSION=$(docker -v | cut -d',' -f1)
    echo "✅ $DOCKER_VERSION"
}

# 检查是否安装了Docker Compose
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ 错误: 未安装Docker Compose，请先安装Docker Compose"
        exit 1
    fi
    DOCKER_COMPOSE_VERSION=$(docker-compose -v | cut -d',' -f1)
    echo "✅ $DOCKER_COMPOSE_VERSION"
}

# 安装后端依赖
install_backend_deps() {
    echo ""
    echo "📦 安装后端依赖..."
    cd backend
    npm install
    cd ..
    echo "✅ 后端依赖安装完成"
}

# 安装前端依赖
install_frontend_deps() {
    echo ""
    echo "📦 安装前端依赖..."
    cd frontend
    npm install
    cd ..
    echo "✅ 前端依赖安装完成"
}

# 构建后端
build_backend() {
    echo ""
    echo "🔧 构建后端..."
    cd backend
    npm run build
    cd ..
    echo "✅ 后端构建完成"
}

# 构建前端
build_frontend() {
    echo ""
    echo "🔧 构建前端..."
    cd frontend
    npm run build
    cd ..
    echo "✅ 前端构建完成"
}

# 本地开发模式
local_dev() {
    echo ""
    echo "🚀 启动本地开发模式..."
    echo ""
    echo "📋 启动步骤:"
    echo "1. 启动MongoDB服务"
    echo "2. 启动后端开发服务器"
    echo "3. 启动前端开发服务器"
    echo ""
    echo "🔍 访问地址:"
    echo "- 前端: http://localhost:3000"
    echo "- 后端API: http://localhost:3001/api"
    echo ""
    echo "💡 提示: 请在三个不同的终端窗口分别运行以下命令:"
    echo "   终端1: docker run -d -p 27017:27017 --name keypro-mongodb mongo"
    echo "   终端2: cd backend && npm run dev"
    echo "   终端3: cd frontend && npm run dev"
    echo ""
}

# Docker一键部署
docker_deploy() {
    echo ""
    echo "🚀 开始Docker一键部署..."
    echo ""
    
    # 检查Docker和Docker Compose
    check_docker
    check_docker_compose
    
    # 停止并删除旧容器
    echo "📦 清理旧容器..."
    docker-compose down
    
    # 构建并启动新容器
    echo "🔧 构建并启动容器..."
    docker-compose up -d --build
    
    echo ""
    echo "✅ Docker部署完成！"
    echo ""
    echo "🔍 访问地址:"
    echo "- 系统首页: http://localhost"
    echo "- 后端API: http://localhost:3001/api"
    echo "- MongoDB: mongodb://localhost:27017"
    echo ""
    echo "💡 提示: 初始管理员账号密码:"
    echo "   用户名: admin"
    echo "   密码: admin123"
    echo ""
    echo "📋 查看日志命令:"
    echo "   docker-compose logs -f"
    echo ""
}

# 显示帮助信息
show_help() {
    echo "📋 命令用法:"
    echo "   ./start.sh [选项]"
    echo ""
    echo "🔧 选项:"
    echo "   install     安装所有依赖"
    echo "   build       构建前后端代码"
    echo "   local-dev   启动本地开发模式"
    echo "   docker-deploy  Docker一键部署"
    echo "   help        显示帮助信息"
    echo ""
    echo "📝 示例:"
    echo "   ./start.sh install          # 安装所有依赖"
    echo "   ./start.sh docker-deploy    # Docker一键部署"
    echo ""
}

# 主函数
main() {
    echo "========================================"
    echo "科浦诺外贸管理系统启动脚本"
    echo "========================================"
    echo ""
    
    case "$1" in
        install)
            check_node
            check_npm
            install_backend_deps
            install_frontend_deps
            echo ""
            echo "✅ 所有依赖安装完成！"
            ;;
        build)
            check_node
            check_npm
            build_backend
            build_frontend
            echo ""
            echo "✅ 构建完成！"
            ;;
        local-dev)
            check_node
            check_npm
            local_dev
            ;;
        docker-deploy)
            docker_deploy
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            echo "❌ 错误: 无效的命令参数"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
