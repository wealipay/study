# Next.js 15 + Supabase + Tailwind CSS v4 Starter

这是一个现代化的全栈 Web 应用程序启动模板，集成了最新的技术栈：

- **Next.js 15** - 使用 App Router 的 React 框架
- **Supabase** - 开源 Firebase 替代品，提供数据库和认证
- **Tailwind CSS v4** - 实用优先的 CSS 框架
- **TypeScript** - 类型安全的 JavaScript

## ✨ 特性

- 🚀 **Next.js 15** 与 App Router
- 🔐 **Supabase 认证** 与 SSR 支持
- 🎨 **Tailwind CSS v4** 最新版本
- 📱 **响应式设计** 移动端优先
- 🔒 **中间件保护** 路由安全
- 🌐 **服务端渲染** SEO 友好
- ⚡ **Turbopack** 快速开发构建

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd nextjs15-supabase-tailwindcss-starter
```

### 2. 安装依赖

```bash
npm install
```

### 3. 设置环境变量

复制 `.env.local` 文件并填入你的 Supabase 凭据：

```bash
cp .env.local .env.local.example
```

更新 `.env.local` 文件：

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. 设置 Supabase

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 在项目设置中找到 API 设置
3. 复制 `Project URL` 和 `anon public` 密钥到环境变量
4. 复制 `service_role secret` 密钥到环境变量（仅服务端使用）

### 5. 运行开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📁 项目结构

```
├── src/
│   ├── app/                # App Router 页面
│   │   ├── login/          # 登录页面
│   │   ├── page.tsx        # 主页
│   │   ├── layout.tsx      # 根布局
│   │   └── globals.css     # 全局样式
│   ├── components/         # React 组件
│   │   └── LogoutButton.tsx
│   ├── lib/                # 工具库
│   │   └── supabase/       # Supabase 配置
│   │       ├── client.ts   # 客户端配置
│   │       └── server.ts   # 服务端配置
│   └── middleware.ts       # Next.js 中间件
├── .env.local             # 环境变量
├── package.json
├── tailwind.config.js     # Tailwind 配置
└── tsconfig.json         # TypeScript 配置
```

## 🔧 主要配置

### Supabase 客户端配置

项目使用最新的 `@supabase/ssr` 包来处理服务端渲染：

- `src/lib/supabase/client.ts` - 客户端配置
- `src/lib/supabase/server.ts` - 服务端配置
- `src/middleware.ts` - 认证中间件

### Tailwind CSS v4

项目配置了最新的 Tailwind CSS v4：

- 使用 `@import "tailwindcss"` 导入
- 支持内联主题配置
- 现代化的 CSS 变量系统

### 认证流程

1. 用户访问受保护的路由
2. 中间件检查认证状态
3. 未认证用户重定向到 `/login`
4. 登录成功后重定向到主页

## 📝 使用说明

### 添加新页面

在 `src/app/` 目录下创建新文件夹和 `page.tsx` 文件：

```tsx
// src/app/dashboard/page.tsx
export default function Dashboard() {
  return <div>Dashboard Page</div>
}
```

### 添加数据库操作

```tsx
import { createClient } from '@/lib/supabase/server'

export async function getData() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('your_table')
    .select('*')
  
  return data
}
```

### 添加受保护的路由

路由会自动受到中间件保护。要排除某些路由，更新 `src/middleware.ts`：

```tsx
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public-page).*)',
  ],
}
```

## 🚀 部署

### Vercel (推荐)

1. 推送代码到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 添加环境变量
4. 部署！

### 其他平台

确保在部署平台设置以下环境变量：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 📚 学习资源

- [Next.js 15 文档](https://nextjs.org/docs)
- [Supabase 文档](https://supabase.com/docs)
- [Tailwind CSS v4 文档](https://tailwindcss.com/docs)
- [TypeScript 文档](https://www.typescriptlang.org/docs)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
