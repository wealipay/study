# 🔧 "Invalid login credentials" 故障排查指南

## 🚨 错误信息分析

**错误**: `Invalid login credentials`
**含义**: 用户名/密码组合不正确或用户不存在

## 🔍 逐步排查

### 步骤 1: 确认账户是否存在

**最常见问题**: 尝试登录未注册的账户

#### ✅ 解决方案：先注册账户
1. 在登录页面输入邮箱和密码
2. **点击 "Sign Up" 按钮**（不是 Sign In）
3. 等待成功提示
4. 然后用相同信息点击 "Sign In"

### 步骤 2: 检查输入信息

#### 📧 邮箱格式
- ✅ 正确: `test@example.com`
- ❌ 错误: `test@example` (缺少域名)
- ❌ 错误: `test.example.com` (缺少@符号)

#### 🔑 密码要求
- 最少 6 个字符
- 区分大小写
- 特殊字符通常允许

### 步骤 3: 验证 Supabase 配置

#### 检查环境变量
```bash
# 运行配置检查
node check-auth-setup.js
```

#### 必需变量
- `NEXT_PUBLIC_SUPABASE_URL`: 必须是有效的 https URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 必须是有效的 JWT token

## 🎯 推荐的测试流程

### 使用建议的测试账号

```
邮箱: test@example.com
密码: password123
```

#### 完整操作步骤：
1. **打开登录页面**
2. **输入测试邮箱和密码**
3. **点击 "Sign Up"** (关键步骤)
4. **查看响应消息**:
   - 成功: "Check your email for confirmation" 或直接登录
   - 失败: 显示具体错误信息
5. **点击 "Sign In"** 使用相同信息登录

## 🔧 具体问题和解决方案

### 问题 1: 邮箱验证未完成
**症状**: 注册成功但无法登录
**解决方案**: 
- 检查邮箱确认链接
- 或在 Supabase Dashboard 手动确认用户

### 问题 2: Supabase 配置错误
**症状**: 注册和登录都失败
**解决方案**: 
- 检查 Vercel 环境变量
- 验证 Supabase 项目状态
- 确认认证设置已启用

### 问题 3: 网络连接问题
**症状**: 请求超时或连接失败
**解决方案**: 
- 检查网络连接
- 查看浏览器控制台错误
- 确认 Supabase 服务状态

## 🛠️ 调试工具

### 浏览器控制台检查
1. 打开开发者工具 (F12)
2. 查看 Console 标签的错误信息
3. 检查 Network 标签的请求状态

### Supabase Dashboard 检查
1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目 → Authentication → Users
3. 查看用户列表和状态
4. 检查认证设置 → Settings

## 📋 常见错误信息对照

| 错误信息 | 原因 | 解决方案 |
|----------|------|----------|
| `Invalid login credentials` | 账户不存在或密码错误 | 先注册账户 |
| `Email not confirmed` | 邮箱未验证 | 检查确认邮件 |
| `User not found` | 账户不存在 | 先注册账户 |
| `Wrong password` | 密码错误 | 检查密码正确性 |
| `Too many requests` | 请求过频繁 | 等待几分钟后重试 |

## 🎯 快速修复检查清单

- [ ] 1. 确认使用 "Sign Up" 而不是 "Sign In" 来注册
- [ ] 2. 验证邮箱格式正确
- [ ] 3. 确认密码符合要求
- [ ] 4. 检查 Supabase 环境变量配置
- [ ] 5. 查看浏览器控制台错误
- [ ] 6. 在 Supabase Dashboard 确认用户状态

## 💡 最佳实践建议

1. **首次使用**: 总是先注册再登录
2. **测试环境**: 使用简单的测试邮箱和密码
3. **生产环境**: 使用真实邮箱以接收验证邮件
4. **安全考虑**: 设置强密码和适当的认证策略

---

**🚀 如果按照以上步骤仍有问题，请提供：**
- 具体的错误消息
- 浏览器控制台的错误信息
- 您的操作步骤
- Supabase 配置状态