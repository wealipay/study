import { createClient } from '@supabase/supabase-js'
import type { Database, ExamSession, ExamWithQuestions } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// 考试相关函数
export async function getExams() {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getExamWithQuestions(examId: string): Promise<ExamWithQuestions | null> {
  const { data: exam, error: examError } = await supabase
    .from('exams')
    .select('*')
    .eq('id', examId)
    .single()

  if (examError) throw examError
  if (!exam) return null

  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .eq('exam_id', examId)
    .order('order_index')

  if (questionsError) throw questionsError

  return {
    ...exam,
    questions: questions || []
  }
}

// 考试会话相关函数
export async function createExamSession(examId: string, userId: string) {
  const exam = await getExamWithQuestions(examId)
  if (!exam) throw new Error('考试不存在')

  const { data, error } = await supabase
    .from('exam_sessions')
    .insert({
      exam_id: examId,
      user_id: userId,
      max_score: exam.total_points,
      is_completed: false,
      answers: {},
      time_remaining: exam.duration_minutes * 60 // 转换为秒
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getExamSession(sessionId: string) {
  const { data, error } = await supabase
    .from('exam_sessions')
    .select(`
      *,
      exam:exams(*),
      user_answers(*)
    `)
    .eq('id', sessionId)
    .single()

  if (error) throw error
  return data
}

export async function updateExamSession(sessionId: string, updates: Partial<ExamSession>) {
  const { data, error } = await supabase
    .from('exam_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single()

  if (error) throw error
  return data
}

// 答案相关函数
export async function saveAnswer(
  sessionId: string,
  questionId: string,
  answerData: {
    answer_text?: string
    selected_options?: string[]
  }
) {
  // 首先检查是否已有答案
  const { data: existingAnswer, error: fetchError } = await supabase
    .from('user_answers')
    .select('*')
    .eq('session_id', sessionId)
    .eq('question_id', questionId)
    .maybeSingle()

  if (fetchError) throw fetchError

  const answerPayload = {
    session_id: sessionId,
    question_id: questionId,
    ...answerData,
    is_correct: false, // 将在评分时更新
    points_earned: 0
  }

  if (existingAnswer) {
    // 更新现有答案
    const { data, error } = await supabase
      .from('user_answers')
      .update(answerPayload)
      .eq('id', existingAnswer.id)
      .select()
      .single()

    if (error) throw error
    return data
  } else {
    // 创建新答案
    const { data, error } = await supabase
      .from('user_answers')
      .insert(answerPayload)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

export async function calculateScore(sessionId: string) {
  // 获取考试会话和相关数据
  const { data: session, error: sessionError } = await supabase
    .from('exam_sessions')
    .select(`
      *,
      exam:exams(*),
      user_answers(*)
    `)
    .eq('id', sessionId)
    .single()

  if (sessionError) throw sessionError

  // 获取题目信息
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .eq('exam_id', session.exam_id)

  if (questionsError) throw questionsError

  let totalScore = 0
  const maxScore = session.max_score

  // 评分每个答案
  for (const answer of session.user_answers) {
    const question = questions.find(q => q.id === answer.question_id)
    if (!question) continue

    let isCorrect = false
    let pointsEarned = 0

    if (question.question_type === 'fill_blank') {
      // 填空题：简单的字符串匹配（可以扩展为更复杂的匹配逻辑）
      const userAnswer = answer.answer_text?.trim().toLowerCase()
      const correctAnswer = question.correct_answer?.trim().toLowerCase()
      isCorrect = userAnswer === correctAnswer
    } else if (question.question_type === 'single_choice') {
      // 单选题
      const userAnswer = answer.selected_options?.[0]
      isCorrect = userAnswer === question.correct_answer
    } else if (question.question_type === 'multiple_choice') {
      // 多选题
      const userAnswers = new Set(answer.selected_options || [])
      const correctAnswers = new Set(question.correct_answer?.split(',') || [])
      isCorrect = userAnswers.size === correctAnswers.size && 
                 [...userAnswers].every(ans => correctAnswers.has(ans))
    }

    if (isCorrect) {
      pointsEarned = question.points
      totalScore += pointsEarned
    }

    // 更新答案的评分
    await supabase
      .from('user_answers')
      .update({
        is_correct: isCorrect,
        points_earned: pointsEarned
      })
      .eq('id', answer.id)
  }

  // 更新考试会话的总分
  const { error } = await supabase
    .from('exam_sessions')
    .update({
      total_score: totalScore,
      is_completed: true,
      ended_at: new Date().toISOString()
    })
    .eq('id', sessionId)
    .select()
    .single()

  if (error) throw error

  return {
    totalScore,
    maxScore,
    percentage: Math.round((totalScore / maxScore) * 100),
    passed: totalScore >= ((session.exam as { passing_score: number }).passing_score)
  }
}

// 获取用户的考试历史
export async function getUserExamHistory(userId: string) {
  const { data, error } = await supabase
    .from('exam_sessions')
    .select(`
      *,
      exam:exams(title, description, passing_score)
    `)
    .eq('user_id', userId)
    .eq('is_completed', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}