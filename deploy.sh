#!/bin/bash

# Next.js 15 + Supabase + Tailwind CSS v4 Vercel 部署脚本

echo "🚀 开始部署到 Vercel..."

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装"
    echo "📦 正在安装 Vercel CLI..."
    npm install -g vercel
fi

# 检查是否已登录
echo "🔐 检查 Vercel 登录状态..."
if ! vercel whoami &> /dev/null; then
    echo "⚠️  请先登录 Vercel:"
    echo "   vercel login"
    exit 1
fi

# 确保构建成功
echo "🔨 测试本地构建..."
if ! npm run build; then
    echo "❌ 构建失败，请修复错误后重试"
    exit 1
fi

echo "✅ 构建成功！"

# 提交所有更改
echo "📝 提交更改..."
git add .
git commit -m "Ready for production deployment" || echo "没有新的更改需要提交"

# 推送到 GitHub
echo "📤 推送到 GitHub..."
git push origin HEAD

# 部署到 Vercel
echo "🚀 部署到 Vercel..."
vercel --prod

echo ""
echo "🎉 部署完成！"
echo ""
echo "📋 下一步："
echo "1. 在 Vercel Dashboard 配置环境变量"
echo "2. 设置 Supabase 密钥"
echo "3. 验证部署功能"
echo ""
echo "🔗 有用链接："
echo "- Vercel Dashboard: https://vercel.com/dashboard"
echo "- Supabase Dashboard: https://supabase.com/dashboard"
echo ""
echo "📖 详细指南: 查看 VERCEL_DEPLOYMENT_GUIDE.md"