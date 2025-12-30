# 阿里云部署指南

## 📋 目录

- [方式一：ECS + 宝塔面板部署（推荐新手）](#方式一ecs--宝塔面板部署推荐新手)
- [方式二：ECS 直接部署（推荐进阶）](#方式二ecs-直接部署推荐进阶)
- [方式三：容器服务部署](#方式三容器服务部署)
- [常见问题排查](#常见问题排查)

---

## 方式一：ECS + 宝塔面板部署（推荐新手）

### 1. 购买和配置阿里云 ECS

#### 1.1 购买 ECS 实例

1. 登录 [阿里云控制台](https://ecs.console.aliyun.com/)
2. 进入 **云服务器 ECS** → **实例与镜像** → **实例**
3. 点击 **创建实例**
4. 推荐配置：
   - **地域**：选择离您最近的地域（如：华东1-杭州）
   - **实例规格**：`ecs.t6-c1m2.large`（2核2G）或更高
   - **镜像**：选择 **CentOS 7.9** 或 **Ubuntu 20.04**
   - **系统盘**：40GB SSD
   - **网络**：选择专有网络 VPC
   - **公网IP**：分配公网 IPv4 地址
   - **安全组**：开放以下端口
     - 22（SSH）
     - 80（HTTP）
     - 443（HTTPS）
     - 3000（应用端口，可选）
     - 8888（宝塔面板端口）

#### 1.2 配置安全组规则

1. 进入 **网络与安全** → **安全组**
2. 找到您的安全组，点击 **配置规则**
3. 添加入站规则：

| 规则方向 | 授权策略 | 协议类型 | 端口范围 | 授权对象 |
|---------|---------|---------|---------|---------|
| 入方向 | 允许 | TCP | 22/22 | 0.0.0.0/0 |
| 入方向 | 允许 | TCP | 80/80 | 0.0.0.0.0/0 |
| 入方向 | 允许 | TCP | 443/443 | 0.0.0.0/0 |
| 入方向 | 允许 | TCP | 3000/3000 | 0.0.0.0/0 |
| 入方向 | 允许 | TCP | 8888/8888 | 0.0.0.0/0 |

### 2. 安装宝塔面板

#### 2.1 连接服务器

使用 SSH 工具（如 PuTTY、Xshell）连接服务器：

```bash
ssh root@您的公网IP
```

#### 2.2 安装宝塔面板

**CentOS 系统：**
```bash
yum install -y wget && wget -O install.sh https://download.bt.cn/install/install_6.0.sh && sh install.sh
```

**Ubuntu/Debian 系统：**
```bash
wget -O install.sh https://download.bt.cn/install/install-ubuntu_6.0.sh && sudo bash install.sh
```

安装完成后，会显示：
- 面板地址：`http://您的IP:8888`
- 用户名和密码（请妥善保存）

#### 2.3 登录宝塔面板

1. 在浏览器访问：`http://您的IP:8888`
2. 使用安装时显示的用户名和密码登录
3. 首次登录会提示安装 LNMP 或 LAMP，选择 **LNMP**（推荐）

### 3. 在宝塔面板中部署项目

#### 3.1 安装 Node.js 版本管理器

1. 进入 **软件商店** → 搜索 **Node.js版本管理器** → 安装
2. 安装完成后，进入 **Node.js版本管理器**
3. 安装 Node.js 18.x 或更高版本

#### 3.2 创建 Node.js 项目

1. 在 **Node.js版本管理器** 中点击 **添加Node.js项目**
2. 配置如下：
   - **项目名称**：`yiwen-dataagent`
   - **项目路径**：`/www/wwwroot/yiwen-dataagent`
   - **Node版本**：选择 18.x 或更高
   - **启动文件**：`server.js`
   - **运行端口**：`3000`
   - **运行目录**：`/www/wwwroot/yiwen-dataagent`

#### 3.3 上传项目文件

**方式一：通过宝塔文件管理器**

1. 进入 **文件** → 找到 `/www/wwwroot/yiwen-dataagent` 目录
2. 上传以下文件：
   - `server.js`
   - `package.json`
   - `package-lock.json`
   - `index.html`
   - `api-client.js`
   - `script.js`
   - `style.css`
   - `chat-clean.css`
   - `workflow.css`
   - `process-ui.css`
   - `indicator-platform.html`
   - `indicator-platform.js`

**方式二：通过 Git（推荐）**

在宝塔面板的 **终端** 中执行：

```bash
cd /www/wwwroot
git clone https://github.com/mm1025048717-hash/yiwen-dataagent2.0-.git yiwen-dataagent
cd yiwen-dataagent
```

#### 3.4 安装依赖

在宝塔面板的 Node.js 项目管理器中：
- 找到 `yiwen-dataagent` 项目
- 点击 **依赖管理** → **安装依赖**

或在终端执行：
```bash
cd /www/wwwroot/yiwen-dataagent
npm install --production
```

#### 3.5 配置环境变量

在宝塔面板的 Node.js 项目管理器中：
- 找到 `yiwen-dataagent` 项目
- 点击 **环境变量**
- 添加：
  - `DEEPSEEK_API_KEY` = `sk-e8312e0eae874f2f9122f6aa334f4b3f`
  - `NODE_ENV` = `production`
  - `PORT` = `3000`

#### 3.6 启动项目

在 Node.js 项目管理器中：
- 找到 `yiwen-dataagent` 项目
- 点击 **启动** 按钮

### 4. 配置网站和反向代理

#### 4.1 创建网站

1. 进入 **网站** → **添加站点**
2. 填写：
   - **域名**：`dataagent.您的域名.com`（或使用IP：`dataagent.您的IP`）
   - **根目录**：`/www/wwwroot/yiwen-dataagent`
   - **备注**：`亿问DataAgent`
3. 点击 **提交**

#### 4.2 配置反向代理

1. 进入 **网站** → 找到刚创建的站点 → **设置** → **反向代理**
2. 点击 **添加反向代理**
3. 配置：
   - **代理名称**：`nodejs`
   - **代理目录**：`/`
   - **目标URL**：`http://127.0.0.1:3000`
   - **发送域名**：`$host`
4. 点击 **提交**

### 5. 配置域名（可选）

如果您有域名：

1. 在阿里云 **域名控制台** 添加 A 记录：
   - 主机记录：`dataagent`（或 `@` 表示根域名）
   - 记录类型：`A`
   - 记录值：您的 ECS 公网 IP
   - TTL：10分钟

2. 在宝塔面板中配置 SSL 证书（推荐）：
   - 进入网站设置 → **SSL** → **Let's Encrypt**
   - 申请免费证书并开启强制 HTTPS

---

## 方式二：ECS 直接部署（推荐进阶）

### 1. 连接服务器并安装 Node.js

```bash
# 连接服务器
ssh root@您的公网IP

# 更新系统（CentOS）
yum update -y

# 安装 Node.js 18.x（使用 NodeSource）
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# 验证安装
node -v
npm -v
```

### 2. 安装 Nginx

```bash
# CentOS
yum install -y nginx

# Ubuntu
apt update
apt install -y nginx

# 启动并设置开机自启
systemctl start nginx
systemctl enable nginx
```

### 3. 部署项目

```bash
# 创建项目目录
mkdir -p /www/wwwroot/yiwen-dataagent
cd /www/wwwroot/yiwen-dataagent

# 方式一：使用 Git
git clone https://github.com/mm1025048717-hash/yiwen-dataagent2.0-.git .

# 方式二：使用 SCP 上传（在本地执行）
# scp -r * root@您的IP:/www/wwwroot/yiwen-dataagent/

# 安装依赖
npm install --production
```

### 4. 配置环境变量

```bash
# 创建 .env 文件
cat > /www/wwwroot/yiwen-dataagent/.env << EOF
DEEPSEEK_API_KEY=sk-e8312e0eae874f2f9122f6aa334f4b3f
NODE_ENV=production
PORT=3000
EOF
```

### 5. 使用 PM2 管理进程

```bash
# 全局安装 PM2
npm install -g pm2

# 启动应用
cd /www/wwwroot/yiwen-dataagent
pm2 start server.js --name yiwen-dataagent

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs yiwen-dataagent
```

### 6. 配置 Nginx 反向代理

```bash
# 创建 Nginx 配置文件
cat > /etc/nginx/conf.d/yiwen-dataagent.conf << 'EOF'
server {
    listen 80;
    server_name dataagent.您的域名.com;  # 或使用IP

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# 测试配置
nginx -t

# 重载配置
systemctl reload nginx
```

### 7. 配置防火墙

```bash
# CentOS 7 (firewalld)
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-port=3000/tcp
firewall-cmd --reload

# Ubuntu (ufw)
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw reload
```

---

## 方式三：容器服务部署

### 1. 创建 Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制项目文件
COPY . .

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "server.js"]
```

### 2. 创建 .dockerignore

```
node_modules
npm-debug.log
.git
.env
*.md
```

### 3. 构建和推送镜像

```bash
# 登录阿里云容器镜像服务
docker login --username=您的用户名 registry.cn-hangzhou.aliyuncs.com

# 构建镜像
docker build -t registry.cn-hangzhou.aliyuncs.com/您的命名空间/yiwen-dataagent:latest .

# 推送镜像
docker push registry.cn-hangzhou.aliyuncs.com/您的命名空间/yiwen-dataagent:latest
```

### 4. 在 ACK 中部署

1. 登录 [容器服务控制台](https://cs.console.aliyun.com/)
2. 创建集群或使用现有集群
3. 创建工作负载，选择刚才推送的镜像
4. 配置环境变量和端口映射
5. 创建服务（Service）和入口（Ingress）

---

## 常见问题排查

### 1. 无法访问网站

**检查清单：**
- [ ] 安全组是否开放了 80/443 端口
- [ ] 防火墙是否允许 HTTP/HTTPS 流量
- [ ] Node.js 应用是否正常运行（`pm2 status` 或宝塔面板查看）
- [ ] Nginx 是否正常运行（`systemctl status nginx`）
- [ ] 反向代理配置是否正确

**查看日志：**
```bash
# PM2 日志
pm2 logs yiwen-dataagent

# Nginx 日志
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# 系统日志
journalctl -u nginx -f
```

### 2. 静态文件 404

- 确保所有 CSS/JS 文件都已上传到项目目录
- 检查 `server.js` 中的静态文件路径配置
- 查看浏览器控制台的网络请求

### 3. API 请求失败

- 检查 `DEEPSEEK_API_KEY` 环境变量是否正确配置
- 查看服务器日志确认 API 调用情况
- 测试 API 连接：`curl http://localhost:3000/api/health`

### 4. 端口被占用

```bash
# 查看端口占用
netstat -tlnp | grep 3000

# 或使用
lsof -i :3000

# 杀死占用进程
kill -9 <PID>
```

### 5. Node.js 版本问题

```bash
# 检查 Node.js 版本
node -v

# 如果版本过低，使用 nvm 安装
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

### 6. 内存不足

如果服务器内存较小，可以：
- 优化 Node.js 内存使用
- 使用 `--max-old-space-size` 限制内存
- 升级服务器配置

---

## 性能优化建议

### 1. 使用 CDN 加速静态资源

将 CSS/JS 文件上传到阿里云 OSS，并通过 CDN 加速访问。

### 2. 启用 Gzip 压缩

在 Nginx 配置中启用 Gzip：

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

### 3. 配置缓存策略

```nginx
location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### 4. 使用负载均衡

如果访问量大，可以使用阿里云 SLB（负载均衡）分发流量到多台 ECS。

---

## 安全建议

1. **定期更新系统**：`yum update` 或 `apt update && apt upgrade`
2. **使用强密码**：SSH 和数据库密码
3. **配置 SSH 密钥登录**：禁用密码登录
4. **安装 Fail2ban**：防止暴力破解
5. **定期备份**：使用阿里云快照功能
6. **配置 SSL 证书**：启用 HTTPS
7. **限制 API Key 权限**：不要将 API Key 提交到代码仓库

---

## 成本优化

1. **选择合适的实例规格**：根据实际流量选择
2. **使用抢占式实例**：适合测试环境
3. **配置自动伸缩**：根据负载自动调整
4. **使用对象存储 OSS**：存储静态文件，降低 ECS 成本
5. **定期检查未使用的资源**：及时释放

---

## 联系支持

- 阿里云工单系统：https://workorder.console.aliyun.com/
- 阿里云技术支持：95187
- 项目问题：查看项目 GitHub Issues

---

**部署完成后，访问您的域名或 IP 地址即可使用亿问DataAgent！** 🎉

