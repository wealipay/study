'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
// import { Progress } from '@/components/ui/progress' // Not used currently
import { getExamSession, getExamWithQuestions } from '@/lib/exam-service'
import { createClient } from '@/lib/supabase/client'
import type { ExamSession, Question, UserAnswer, ExamWithQuestions } from '@/lib/types'
import { 
  Trophy, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Award,
  AlertCircle
} from 'lucide-react'

export default function ExamResultPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const supabase = createClient()

  const [session, setSession] = useState<ExamSession | null>(null)
  const [exam, setExam] = useState<ExamWithQuestions | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadExamResult()
  }, [sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadExamResult = async () => {
    try {
      // 验证用户
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // 获取考试会话
      const sessionData = await getExamSession(sessionId)
      if (!sessionData) {
        router.push('/exams')
        return
      }

      // 检查会话是否属于当前用户
      if (sessionData.user_id !== user.id) {
        router.push('/exams')
        return
      }

      // 检查考试是否已完成
      if (!sessionData.is_completed) {
        router.push(`/exam/${sessionId}`)
        return
      }

      setSession(sessionData)

      // 获取考试详情和题目
      const examData = await getExamWithQuestions(sessionData.exam_id)
      if (examData) {
        setExam(examData)
        setQuestions(examData.questions)
      }

      // 将用户答案转换为字典格式
      const answersMap: Record<string, UserAnswer> = {}
      if (sessionData.user_answers) {
        sessionData.user_answers.forEach((answer: UserAnswer) => {
          answersMap[answer.question_id] = answer
        })
      }
      setUserAnswers(answersMap)

    } catch (error) {
      console.error('加载考试结果失败:', error)
      router.push('/exams')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">加载考试结果中...</p>
        </div>
      </div>
    )
  }

  if (!session || !exam || questions.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <h3 className="text-lg font-semibold mb-2">考试结果不存在</h3>
            <p className="text-muted-foreground mb-4">该考试结果可能已被删除或您没有权限访问</p>
            <Button onClick={() => router.push('/exams')}>返回考试列表</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalScore = session.total_score || 0
  const maxScore = session.max_score
  const percentage = Math.round((totalScore / maxScore) * 100)
  const passed = totalScore >= exam.passing_score
  const correctAnswers = Object.values(userAnswers).filter(answer => answer.is_correct).length
  const totalQuestions = questions.length
  const correctRate = Math.round((correctAnswers / totalQuestions) * 100)

  const getScoreColor = () => {
    if (passed) return 'text-green-600'
    if (percentage >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBgColor = () => {
    if (passed) return 'bg-green-50 border-green-200'
    if (percentage >= 50) return 'bg-orange-50 border-orange-200'
    return 'bg-red-50 border-red-200'
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* 考试结果总览 */}
      <Card className={`mb-8 ${getScoreBgColor()}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {passed ? (
              <Trophy className="h-16 w-16 text-yellow-500" />
            ) : (
              <AlertCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl mb-2">
            {exam.title} - 考试结果
          </CardTitle>
          <div className={`text-4xl font-bold ${getScoreColor()}`}>
            {totalScore} / {maxScore} 分
          </div>
          <div className={`text-lg ${getScoreColor()}`}>
            {percentage}% {passed ? '✅ 通过' : '❌ 未通过'}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-2">
              <Target className="h-6 w-6 mx-auto text-muted-foreground" />
              <div className="text-sm text-muted-foreground">得分率</div>
              <div className="text-xl font-semibold">{percentage}%</div>
            </div>
            <div className="space-y-2">
              <CheckCircle className="h-6 w-6 mx-auto text-muted-foreground" />
              <div className="text-sm text-muted-foreground">正确率</div>
              <div className="text-xl font-semibold">{correctRate}%</div>
            </div>
            <div className="space-y-2">
              <Award className="h-6 w-6 mx-auto text-muted-foreground" />
              <div className="text-sm text-muted-foreground">及格分</div>
              <div className="text-xl font-semibold">{exam.passing_score}</div>
            </div>
            <div className="space-y-2">
              <Clock className="h-6 w-6 mx-auto text-muted-foreground" />
              <div className="text-sm text-muted-foreground">完成时间</div>
              <div className="text-xl font-semibold">
                {session.ended_at ? new Date(session.ended_at).toLocaleString() : '未知'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 答题详情 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>答题详情</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {questions.map((question, index) => {
              const userAnswer = userAnswers[question.id]
              const isCorrect = userAnswer?.is_correct || false
              
              return (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">第 {index + 1} 题</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {question.question_type === 'fill_blank' ? '填空题' : 
                         question.question_type === 'single_choice' ? '单选题' : '多选题'}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        {question.points} 分
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className={`text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {isCorrect ? '正确' : '错误'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <strong>题目：</strong>
                      <span className="ml-2">{question.question_text}</span>
                    </div>

                    {question.question_type !== 'fill_blank' && question.options && (
                      <div>
                        <strong>选项：</strong>
                        <ul className="ml-6 mt-1 space-y-1">
                          {question.options.map((option, optionIndex) => (
                            <li key={optionIndex} className="text-sm">
                              • {option}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <strong>您的答案：</strong>
                      <span className={`ml-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {userAnswer ? (
                          question.question_type === 'fill_blank' 
                            ? userAnswer.answer_text || '未答'
                            : userAnswer.selected_options?.join(', ') || '未答'
                        ) : '未答'}
                      </span>
                    </div>

                    <div>
                      <strong>正确答案：</strong>
                      <span className="ml-2 text-green-600">
                        {question.correct_answer || '无'}
                      </span>
                    </div>

                    <div>
                      <strong>得分：</strong>
                      <span className="ml-2">
                        {userAnswer?.points_earned || 0} / {question.points} 分
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => router.push('/exams')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回考试列表
        </Button>
        <Button onClick={() => window.print()}>
          打印结果
        </Button>
      </div>
    </div>
  )
}