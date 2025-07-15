# 在线考试系统使用指南

## 📋 系统概述

这是一个基于 Next.js 15、Supabase 和 Tailwind CSS v4 构建的完整在线考试系统。支持多种题型，具备实时计时、自动评分等功能。

## 🚀 功能特点

### 📝 题型支持
- **填空题**：支持文本填空，自动匹配答案
- **单选题**：单项选择题，支持多个选项
- **多选题**：多项选择题，支持复杂答案组合

### ⏰ 考试功能
- **实时计时器**：显示剩余时间，时间不足时自动警告
- **自动提交**：时间到达自动提交考试
- **题目导航**：快速跳转到任意题目
- **答题进度**：实时显示答题完成情况
- **答案保存**：实时保存用户答案，防止数据丢失

### 📊 评分系统
- **自动评分**：考试结束后立即计算分数
- **详细分析**：显示每题的正确性和得分
- **通过判定**：基于设定的及格分数判断是否通过
- **结果导出**：支持打印考试结果

## 🛠️ 技术栈

- **前端框架**：Next.js 15 (React 19)
- **数据库**：Supabase (PostgreSQL)
- **认证系统**：Supabase Auth
- **样式框架**：Tailwind CSS v4
- **UI 组件**：基于 Radix UI 的自定义组件
- **类型检查**：TypeScript
- **图标库**：Lucide React

## 📦 安装部署

### 1. 克隆项目
```bash
git clone <your-repo-url>
cd exam-system
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
复制 `.env.local.example` 到 `.env.local` 并填入您的 Supabase 配置：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. 初始化数据库
在 Supabase SQL 编辑器中执行 `database.sql` 文件中的 SQL 语句：

```sql
-- 这将创建以下表：
-- - exams: 考试表
-- - questions: 题目表
-- - exam_sessions: 考试会话表
-- - user_answers: 用户答案表
```

### 5. 启动项目
```bash
npm run dev
```

访问 `http://localhost:3000` 开始使用。

## 🗄️ 数据库结构

### 考试表 (exams)
- `id`: 考试唯一标识
- `title`: 考试标题
- `description`: 考试描述
- `duration_minutes`: 考试时长（分钟）
- `total_points`: 总分
- `passing_score`: 及格分数
- `is_active`: 是否启用
- `created_by`: 创建者ID

### 题目表 (questions)
- `id`: 题目唯一标识
- `exam_id`: 所属考试ID
- `question_text`: 题目内容
- `question_type`: 题目类型（fill_blank/single_choice/multiple_choice）
- `points`: 题目分值
- `order_index`: 题目顺序
- `correct_answer`: 正确答案
- `options`: 选项（仅选择题）

### 考试会话表 (exam_sessions)
- `id`: 会话唯一标识
- `exam_id`: 考试ID
- `user_id`: 用户ID
- `started_at`: 开始时间
- `ended_at`: 结束时间
- `total_score`: 总得分
- `max_score`: 满分
- `is_completed`: 是否完成
- `time_remaining`: 剩余时间

### 用户答案表 (user_answers)
- `id`: 答案唯一标识
- `session_id`: 会话ID
- `question_id`: 题目ID
- `answer_text`: 文本答案（填空题）
- `selected_options`: 选择的选项（选择题）
- `is_correct`: 是否正确
- `points_earned`: 获得分数

## 📱 使用流程

### 1. 用户注册/登录
- 访问 `/login` 进行登录或注册
- 支持邮箱/密码认证

### 2. 选择考试
- 登录后访问 `/exams` 查看可用考试
- 点击"开始考试"创建考试会话

### 3. 进行考试
- 在考试页面 `/exam/[sessionId]` 答题
- 支持题目间自由跳转
- 实时保存答案和时间

### 4. 查看结果
- 考试结束后自动跳转到结果页面 `/exam/[sessionId]/result`
- 显示详细的答题分析和得分情况

## 🎯 题目创建指南

### 填空题格式
```
题目文本使用 ______ 表示填空位置，系统会自动生成输入框。
```

### 单选题格式
- 设置 `question_type` 为 `'single_choice'`
- 在 `options` 数组中提供选项
- 在 `correct_answer` 中设置正确答案

### 多选题格式
- 设置 `question_type` 为 `'multiple_choice'`
- 在 `options` 数组中提供选项
- 在 `correct_answer` 中设置正确答案（用逗号分隔）

## 🔧 自定义配置

### 评分算法
可以在 `src/lib/exam-service.ts` 的 `calculateScore` 函数中修改评分逻辑：

```typescript
// 填空题评分（可扩展为模糊匹配）
if (question.question_type === 'fill_blank') {
  const userAnswer = answer.answer_text?.trim().toLowerCase()
  const correctAnswer = question.correct_answer?.trim().toLowerCase()
  isCorrect = userAnswer === correctAnswer
}
```

### 时间警告
可以在 `src/components/exam/ExamTimer.tsx` 中修改时间警告阈值：

```typescript
const isNearEnd = timeRemaining <= 300 // 5分钟警告
const isCritical = timeRemaining <= 60  // 1分钟警告
```

## 🔒 权限控制

系统使用 Supabase RLS（行级别安全）确保数据安全：

- **考试查看**：所有用户可查看活跃考试
- **答案管理**：用户只能管理自己的答案
- **会话控制**：用户只能访问自己的考试会话
- **题目保护**：考试创建者可管理题目

## 📊 性能优化

### 客户端优化
- 使用 React Server Components 减少客户端 JavaScript
- 实时保存答案，减少数据丢失风险
- 分页加载大量题目（可扩展）

### 数据库优化
- 合理的索引设计
- 使用触发器自动计算考试总分
- 连接查询减少数据库请求

## 🚨 注意事项

1. **时间同步**：确保服务器时间准确，避免计时错误
2. **网络中断**：系统会定期保存答案，但建议稳定网络环境
3. **浏览器兼容**：建议使用现代浏览器以获得最佳体验
4. **数据备份**：定期备份 Supabase 数据库
5. **安全更新**：及时更新依赖包以修复安全漏洞

## 🔧 故障排除

### 常见问题

**Q: 考试时间显示不准确**
A: 检查服务器时区设置，确保与用户时区一致

**Q: 答案保存失败**
A: 检查网络连接和 Supabase 配置

**Q: 页面加载缓慢**
A: 检查数据库查询性能，考虑添加索引

**Q: 评分结果错误**
A: 检查题目的正确答案格式是否正确

### 调试模式
开发环境下可以在浏览器控制台查看详细日志：

```javascript
// 查看考试会话状态
console.log('Session:', session)

// 查看用户答案
console.log('Answers:', userAnswers)
```

## 📈 扩展功能

系统支持以下扩展：

- **题目类型**：添加判断题、排序题等
- **媒体支持**：图片、音频、视频题目
- **成绩分析**：统计图表和数据分析
- **考试管理**：管理员界面和权限控制
- **防作弊**：全屏检测、摄像头监控等
- **移动适配**：PWA 支持和移动端优化

## 📞 技术支持

如有问题或建议，请：

1. 查看本文档中的故障排除部分
2. 检查 GitHub Issues
3. 联系开发团队

---

## 📄 许可证

本项目基于 MIT 许可证开源。