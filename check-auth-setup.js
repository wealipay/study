#!/usr/bin/env node

console.log('🔐 Supabase 认证系统配置检查')
console.log('=' .repeat(50))

// 检查环境变量
const envVars = {
  'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

console.log('\n📋 环境变量状态:')
Object.entries(envVars).forEach(([key, value]) => {
  if (value) {
    if (key.includes('URL')) {
      console.log(`✅ ${key}: ${value}`)
      if (!value.startsWith('https://') || value.includes('your_supabase_url')) {
        console.log(`⚠️  警告: 请检查 URL 格式`)
      }
    } else {
      console.log(`✅ ${key}: ***${value.slice(-4)}`)
    }
  } else {
    console.log(`❌ ${key}: 未设置`)
  }
})

console.log('\n🔗 认证流程说明:')
console.log('1. 访问网站主页 → 自动重定向到登录页面')
console.log('2. 首次使用点击 "Sign Up" 注册账号')
console.log('3. 输入邮箱和密码 (密码建议 6+ 字符)')
console.log('4. 注册成功后使用相同信息登录')

console.log('\n🌐 访问地址:')
console.log('- 主页: https://your-project.vercel.app/')
console.log('- 登录: https://your-project.vercel.app/login')

console.log('\n📧 测试账号建议:')
console.log('邮箱: test@example.com')
console.log('密码: password123')
console.log('(需要先在登录页面注册)')

console.log('\n🔧 如果遇到问题:')
console.log('1. 确认 Supabase 环境变量已正确配置')
console.log('2. 检查 Supabase 项目是否启用了认证')
console.log('3. 验证邮箱确认设置（如需要）')

console.log('\n✅ 检查完成！')