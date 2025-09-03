# 教育课件Web应用

基于Fastify框架开发的教育课件浏览、搜索、上传平台。

## 功能特性

### 用户认证
- 用户名/密码登录
- 微信扫码登录（模拟）
- 用户注册
- 会话管理

### 课件管理
- 课件浏览（支持分类过滤）
- 课件搜索
- 课件上传（HTML格式）
- 免费/付费课件区分

### 支付系统
- 微信扫码支付（模拟）
- VIP会员升级
- 付费课件解锁

## 技术栈

- **后端**: Fastify + Node.js
- **数据库**: SQLite
- **前端**: Bootstrap 5 + EJS模板
- **认证**: 会话管理
- **支付**: 微信支付（模拟）

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动应用

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

### 3. 访问应用

打开浏览器访问: http://localhost:3000

## 测试账户

- **普通用户**: 用户名 `user`, 密码 `user123`
- **VIP用户**: 用户名 `admin`, 密码 `admin123`

## 项目结构

```
├── src/
│   ├── app.js              # 主应用文件
│   ├── database.js         # 数据库操作
│   └── routes/             # 路由模块
│       ├── auth.js         # 认证路由
│       ├── courseware.js   # 课件路由
│       └── payment.js      # 支付路由
├── views/                  # EJS模板
│   ├── layout.ejs          # 布局模板
│   ├── index.ejs           # 首页
│   ├── login.ejs           # 登录页
│   ├── register.ejs        # 注册页
│   ├── courseware-detail.ejs # 课件详情
│   ├── upload.ejs          # 上传页面
│   └── upgrade.ejs         # VIP升级页
├── public/                 # 静态资源
│   ├── css/
│   ├── js/
│   └── images/
├── coursewares/            # 课件文件存储
└── data.db                 # SQLite数据库
```

## 主要功能

### 用户系统
- 支持用户注册和登录
- 微信扫码登录集成
- VIP会员系统

### 课件系统
- 课件分类浏览
- 关键词搜索
- HTML课件上传
- 免费/付费权限控制

### 支付系统
- 微信支付二维码生成
- VIP会员升级
- 支付状态跟踪

## 开发说明

### 数据库
应用使用SQLite作为数据库，包含以下表：
- `users`: 用户信息
- `coursewares`: 课件信息  
- `payments`: 支付记录

### Git版本管理
课件文件存储在 `coursewares/` 目录下，可以使用Git进行版本管理：

```bash
cd coursewares
git init
git add .
git commit -m "Initial courseware files"
```

### 扩展功能
- 可以集成真实的微信支付API
- 可以添加课件评论和评分系统
- 可以实现学习进度跟踪
- 可以添加课件收藏功能

## 注意事项

- 当前微信登录和支付功能为模拟实现
- 生产环境需要配置真实的微信API密钥
- 建议使用更安全的会话密钥
- 可以考虑使用Redis作为会话存储 