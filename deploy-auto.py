#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
宝塔面板全自动部署脚本 (Python)
支持通过 SSH 和宝塔 API 自动部署
"""

import os
import sys
import json
import time
import base64
import hashlib
import urllib.parse
from pathlib import Path

try:
    import requests
    import paramiko
    from scp import SCPClient
except ImportError:
    print("❌ 缺少必要的 Python 库")
    print("请安装: pip install requests paramiko scp")
    sys.exit(1)

# 配置
CONFIG = {
    "server_ip": "47.94.146.148",
    "ssh_port": 22,
    "ssh_user": "root",
    "ssh_password": "",  # 如果为空，将提示输入
    "baota_url": "http://47.94.146.148:8888",
    "baota_api_key": "",  # 如果为空，将提示输入
    "baota_api_token": "",  # 如果为空，将提示输入
    "project_dir": "/www/wwwroot/yiwen-dataagent",
    "repo_url": "https://github.com/mm1025048717-hash/yiwen-dataagent2.0-.git",
    "node_version": "18",
    "port": "3000",
    "domain": "dataagent.47.94.146.148"
}

class BaotaAPI:
    """宝塔 API 客户端"""
    
    def __init__(self, url, api_key, api_token):
        self.url = url.rstrip('/')
        self.api_key = api_key
        self.api_token = api_token
    
    def _get_request_token(self):
        """生成请求令牌"""
        timestamp = int(time.time())
        token_string = f"{timestamp}\n{self.api_token}"
        token = base64.b64encode(token_string.encode()).decode()
        return timestamp, urllib.parse.quote(token)
    
    def call(self, action, data=None):
        """调用宝塔 API"""
        if data is None:
            data = {}
        
        timestamp, request_token = self._get_request_token()
        
        url = f"{self.url}/api/{action}"
        payload = {
            "request_token": request_token,
            "request_time": timestamp,
            **data
        }
        
        try:
            response = requests.post(url, data=payload, timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"❌ API 调用失败: {e}")
            return None
    
    def get_node_projects(self):
        """获取 Node.js 项目列表"""
        result = self.call("GetNodeProjectList", {"p": 1, "limit": 100})
        if result and result.get("status"):
            return result.get("data", [])
        return []
    
    def create_node_project(self, name, path, version, port, ps, domain):
        """创建 Node.js 项目"""
        data = {
            "name": name,
            "path": path,
            "project_type": "Node",
            "version": version,
            "port": port,
            "ps": ps,
            "domain": domain
        }
        return self.call("AddNodeProject", data)
    
    def start_node_project(self, project_id):
        """启动 Node.js 项目"""
        return self.call("StartNodeProject", {"id": project_id})
    
    def create_site(self, domain, path, remark=""):
        """创建网站"""
        data = {
            "webname": json.dumps({"domain": domain, "path": path}),
            "path": path,
            "type_id": 0,
            "version": "00",
            "port": 80,
            "ps": remark
        }
        return self.call("AddSite", data)
    
    def add_reverse_proxy(self, site_name, proxy_name, target_url):
        """添加反向代理"""
        data = {
            "sitename": site_name,
            "type": 0,
            "proxyname": proxy_name,
            "cache": 0,
            "proxydir": "/",
            "proxypath": "/",
            "to": target_url,
            "advanced": 0,
            "savename": proxy_name
        }
        return self.call("AddProxy", data)


class SSHDeployer:
    """SSH 部署器"""
    
    def __init__(self, host, port, username, password):
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.client = None
    
    def connect(self):
        """连接 SSH"""
        try:
            self.client = paramiko.SSHClient()
            self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            self.client.connect(
                hostname=self.host,
                port=self.port,
                username=self.username,
                password=self.password,
                timeout=30
            )
            print("✅ SSH 连接成功")
            return True
        except Exception as e:
            print(f"❌ SSH 连接失败: {e}")
            return False
    
    def execute(self, command):
        """执行命令"""
        try:
            stdin, stdout, stderr = self.client.exec_command(command)
            exit_status = stdout.channel.recv_exit_status()
            output = stdout.read().decode('utf-8')
            error = stderr.read().decode('utf-8')
            return exit_status == 0, output, error
        except Exception as e:
            return False, "", str(e)
    
    def deploy_files(self, local_dir, remote_dir):
        """部署文件"""
        try:
            scp = SCPClient(self.client.get_transport())
            scp.put(local_dir, remote_dir, recursive=True)
            scp.close()
            print("✅ 文件上传成功")
            return True
        except Exception as e:
            print(f"❌ 文件上传失败: {e}")
            return False
    
    def deploy_via_git(self, repo_url, project_dir):
        """通过 Git 部署"""
        commands = [
            f"mkdir -p {project_dir}",
            f"cd {project_dir} && (git pull origin main || git pull origin master || git clone {repo_url} .)",
            f"cd {project_dir} && npm install --production",
            f"cd {project_dir} && cat > .env << 'EOF'\nDEEPSEEK_API_KEY=sk-e8312e0eae874f2f9122f6aa334f4b3f\nPORT=3000\nNODE_ENV=production\nEOF"
        ]
        
        for cmd in commands:
            print(f"执行: {cmd}")
            success, output, error = self.execute(cmd)
            if not success:
                print(f"⚠️  命令执行警告: {error}")
            if output:
                print(output)
        
        return True
    
    def close(self):
        """关闭连接"""
        if self.client:
            self.client.close()


def main():
    print("=" * 50)
    print("亿问DataAgent 宝塔面板全自动部署")
    print("=" * 50)
    print()
    
    # 获取配置
    config = CONFIG.copy()
    
    if not config["ssh_password"]:
        import getpass
        config["ssh_password"] = getpass.getpass("请输入 SSH 密码: ")
    
    if not config["baota_api_key"]:
        config["baota_api_key"] = input("请输入宝塔 API Key: ").strip()
    
    if not config["baota_api_token"]:
        config["baota_api_token"] = input("请输入宝塔 API Token: ").strip()
    
    # 步骤 1: SSH 部署文件
    print("\n📦 步骤 1: 通过 SSH 部署文件...")
    ssh = SSHDeployer(
        config["server_ip"],
        config["ssh_port"],
        config["ssh_user"],
        config["ssh_password"]
    )
    
    if not ssh.connect():
        print("❌ 无法连接到服务器")
        return
    
    ssh.deploy_via_git(config["repo_url"], config["project_dir"])
    ssh.close()
    
    # 步骤 2: 通过宝塔 API 配置
    if config["baota_api_key"] and config["baota_api_token"]:
        print("\n📦 步骤 2: 通过宝塔 API 配置...")
        api = BaotaAPI(config["baota_url"], config["baota_api_key"], config["baota_api_token"])
        
        # 检查项目是否存在
        projects = api.get_node_projects()
        project_exists = any(p.get("name") == "yiwen-dataagent" for p in projects)
        
        if not project_exists:
            print("创建 Node.js 项目...")
            result = api.create_node_project(
                name="yiwen-dataagent",
                path=config["project_dir"],
                version=config["node_version"],
                port=config["port"],
                ps="server.js",
                domain=config["domain"]
            )
            if result and result.get("status"):
                print("✅ Node.js 项目创建成功")
            else:
                print("⚠️  项目创建可能失败，请手动检查")
        else:
            print("✅ 项目已存在")
        
        # 启动项目
        print("启动 Node.js 项目...")
        result = api.start_node_project("yiwen-dataagent")
        if result and result.get("status"):
            print("✅ 项目启动成功")
    else:
        print("\n⚠️  未提供宝塔 API 密钥，跳过自动配置")
        print("请手动在宝塔面板中配置 Node.js 项目")
    
    print("\n" + "=" * 50)
    print("✅ 部署完成！")
    print("=" * 50)
    print(f"\n访问地址: http://{config['domain']}")
    print(f"或: http://{config['server_ip']}:{config['port']}")


if __name__ == "__main__":
    main()

