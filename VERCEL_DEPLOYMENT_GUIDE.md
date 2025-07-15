# Vercel 部署指南

## 🚀 快速部署到 Vercel

本指南将帮助您将 Next.js 15 + Supabase + Tailwind CSS v4 项目部署到 Vercel。

## 📋 前置要求

1. **GitHub 账户** - 用于代码托管
2. **Vercel 账户** - 访问 [vercel.com](https://vercel.com) 注册
3. **Supabase 项目** - 访问 [supabase.com](https://supabase.com) 创建项目

## 🔧 方法一：通过 Vercel 网站部署（推荐）

### 步骤 1: 推送代码到 GitHub

```bash
# 如果还没有推送到 GitHub，执行以下命令
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 步骤 2: 连接 Vercel

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "Sign up" 或 "Login"
3. 选择 "Continue with GitHub"
4. 授权 Vercel 访问您的 GitHub 账户

### 步骤 3: 导入项目

1. 在 Vercel Dashboard 点击 "Add New..."
2. 选择 "Project"
3. 从 GitHub 仓库列表中找到您的项目
4. 点击 "Import"

### 步骤 4: 配置项目

Vercel 会自动检测这是一个 Next.js 项目。确认以下设置：

- **Framework Preset**: Next.js
- **Root Directory**: `./` (默认)
- **Build Command**: `npm run build` (默认)
- **Output Directory**: `.next` (默认)
- **Install Command**: `npm install` (默认)

### 步骤 5: 配置环境变量

在 "Environment Variables" 部分添加以下变量：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 您的 Supabase 项目 URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 您的 Supabase 匿名密钥 | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | 您的 Supabase 服务角色密钥 | Production, Preview, Development |

> 💡 **获取 Supabase 密钥**：
> 1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
> 2. 选择您的项目
> 3. 进入 Settings → API
> 4. 复制所需的密钥

### 步骤 6: 部署

1. 点击 "Deploy" 按钮
2. 等待构建完成（通常需要 1-3 分钟）
3. 部署成功后，您将获得一个 `.vercel.app` 域名

## 🔧 方法二：通过 Vercel CLI 部署

### 步骤 1: 安装并登录

```bash
# 全局安装 Vercel CLI（如果还没有安装）
npm install -g vercel

# 登录到 Vercel
vercel login
```

### 步骤 2: 初始化项目

```bash
# 在项目根目录运行
vercel

# 按照提示选择：
# - Set up and deploy? [Y/n] Y
# - Which scope? 选择您的账户
# - Link to existing project? [y/N] N
# - What's your project's name? nextjs15-supabase-tailwindcss-starter
# - In which directory is your code located? ./
```

### 步骤 3: 配置环境变量

```bash
# 添加生产环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# 添加预览环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
vercel env add SUPABASE_SERVICE_ROLE_KEY preview
```

### 步骤 4: 部署

```bash
# 部署到生产环境
vercel --prod
```

## 🔒 环境变量安全提示

### Supabase 密钥获取步骤：

1. **项目 URL**:
   ```
   https://[your-project-id].supabase.co
   ```

2. **匿名密钥 (anon key)**:
   - 可以安全地在客户端使用
   - 用于公共 API 访问

3. **服务角色密钥 (service_role key)**:
   - ⚠️ **绝对保密** - 具有完全数据库访问权限
   - 只在服务器端使用
   - 永远不要在客户端代码中暴露

## 🌐 自定义域名（可选）

### 添加自定义域名：

1. 在 Vercel Dashboard 进入您的项目
2. 点击 "Settings" → "Domains"
3. 点击 "Add"
4. 输入您的域名
5. 按照 DNS 配置指引设置

## 📊 部署后验证

### 检查项目功能：

1. **✅ 访问首页** - 应显示配置指导或欢迎页面
2. **✅ 登录页面** - `/login` 路径可访问
3. **✅ 环境变量** - Supabase 配置正确显示
4. **✅ 样式加载** - Tailwind CSS 正常工作
5. **✅ 认证功能** - 注册/登录流程正常

## 🔄 自动部署

一旦设置完成，每次推送到 GitHub 主分支时，Vercel 会自动：

- 🔨 构建新版本
- 🧪 运行测试
- 🚀 部署到生产环境
- 📧 发送部署通知

## 🐛 常见问题

### 构建失败

```bash
# 本地测试构建
npm run build

# 检查环境变量
vercel env ls
```

### 环境变量问题

- 确保所有必需的环境变量都已设置
- 检查 Supabase 密钥是否正确
- 验证变量名称拼写正确

### 域名解析问题

- 检查 DNS 设置
- 等待 DNS 传播（可能需要几小时）
- 使用 `dig` 或在线 DNS 工具验证

## 🎯 部署清单

- [ ] GitHub 仓库已创建并推送代码
- [ ] Vercel 账户已创建并连接 GitHub
- [ ] Supabase 项目已创建
- [ ] 环境变量已正确配置
- [ ] 项目已成功部署
- [ ] 所有功能已验证
- [ ] 自定义域名已配置（如需要）

## 🚀 部署完成！

恭喜！您的 Next.js 15 + Supabase + Tailwind CSS v4 项目现在已经在 Vercel 上运行。

**下一步**：
- 分享您的部署链接
- 设置 Supabase 数据库表
- 添加更多功能
- 配置 CI/CD 流程

---

**🔗 有用链接**：
- [Vercel 文档](https://vercel.com/docs)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Supabase 文档](https://supabase.com/docs)

如有问题，请查阅官方文档或联系支持团队。