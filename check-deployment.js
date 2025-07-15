#!/usr/bin/env node

console.log('🔍 Next.js + Supabase + Vercel 部署配置检查')
console.log('=' .repeat(50))

// 检查环境变量
console.log('\n📋 环境变量检查:')
const envVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY'
]

envVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    if (varName.includes('URL')) {
      console.log(`✅ ${varName}: ${value}`)
      if (!value.startsWith('https://')) {
        console.log(`⚠️  警告: URL 应该以 https:// 开头`)
      }
    } else {
      console.log(`✅ ${varName}: ***${value.slice(-4)}`)
    }
  } else {
    console.log(`❌ ${varName}: 未设置`)
  }
})

// 检查 package.json
console.log('\n📦 Package.json 检查:')
try {
  const pkg = require('./package.json')
  console.log(`✅ 项目名称: ${pkg.name}`)
  console.log(`✅ Next.js 版本: ${pkg.dependencies.next}`)
  console.log(`✅ Node.js 引擎要求: ${pkg.engines?.node || '未指定'}`)
  
  if (!pkg.engines?.node) {
    console.log('⚠️  建议添加 Node.js 版本要求到 package.json')
  }
} catch (error) {
  console.log('❌ 无法读取 package.json')
}

// 检查 Vercel 配置
console.log('\n⚡ Vercel 配置检查:')
try {
  const vercelConfig = require('./vercel.json')
  console.log(`✅ 框架: ${vercelConfig.framework}`)
  console.log(`✅ 构建命令: ${vercelConfig.buildCommand}`)
  console.log(`✅ 输出目录: ${vercelConfig.outputDirectory}`)
} catch (error) {
  console.log('❌ 无法读取 vercel.json')
}

// 检查必要文件
console.log('\n📁 文件检查:')
const fs = require('fs')
const requiredFiles = [
  'package.json',
  'next.config.ts',
  'tsconfig.json',
  'src/app/page.tsx',
  'src/middleware.ts',
  'vercel.json'
]

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} 缺失`)
  }
})

console.log('\n🎯 建议的调试步骤:')
console.log('1. 检查 Vercel Dashboard 中的构建日志')
console.log('2. 验证所有环境变量都已正确设置')
console.log('3. 确认 GitHub 代码是最新的')
console.log('4. 尝试清除构建缓存重新部署')

console.log('\n📞 如需帮助，请提供:')
console.log('- Vercel 构建日志截图')
console.log('- 环境变量设置截图（隐藏敏感信息）')
console.log('- 项目设置截图')

console.log('\n✅ 检查完成！')