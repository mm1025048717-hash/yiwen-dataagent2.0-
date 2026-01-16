@echo off
chcp 65001 >nul
echo ==========================================
echo 亿问DataAgent 宝塔面板一键部署
echo ==========================================
echo.

REM 检查 Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到 Python，请先安装 Python 3.7+
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM 检查必要的库
python -c "import requests, paramiko, scp" >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 安装必要的 Python 库...
    pip install requests paramiko scp
    if %errorlevel% neq 0 (
        echo ❌ 库安装失败
        pause
        exit /b 1
    )
)

REM 运行部署脚本
echo.
echo 开始部署...
echo.
python deploy-auto.py

pause



