#!/bin/bash

# 宝塔面板自动部署脚本
# 在服务器上执行此脚本

echo "=========================================="
echo "亿问DataAgent 宝塔面板部署脚本"
echo "=========================================="
echo ""

# 配置
PROJECT_DIR="/www/wwwroot/yiwen-dataagent"
REPO_URL="https://github.com/mm1025048717-hash/yiwen-dataagent2.0-.git"

# 1. 创建项目目录
echo "1. 创建项目目录..."
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# 2. 克隆或更新代码
if [ -d ".git" ]; then
    echo "2. 更新代码..."
    git pull origin main
else
    echo "2. 克隆代码..."
    git clone $REPO_URL .
fi

# 3. 安装依赖
echo "3. 安装依赖..."
npm install --production

# 4. 创建 .env 文件
echo "4. 创建环境变量文件..."
cat > .env << EOF
DEEPSEEK_API_KEY=sk-e8312e0eae874f2f9122f6aa334f4b3f
PORT=3000
NODE_ENV=production
EOF

echo ""
echo "=========================================="
echo "部署完成！"
echo "=========================================="
echo ""
echo "下一步操作："
echo "1. 在宝塔面板的 Node.js 管理器中添加项目"
echo "2. 项目路径：$PROJECT_DIR"
echo "3. 启动文件：server.js"
echo "4. 运行端口：3000"
echo "5. 配置环境变量（已在 .env 文件中）"
echo "6. 启动项目"
echo "7. 在网站管理中配置反向代理"
echo ""


