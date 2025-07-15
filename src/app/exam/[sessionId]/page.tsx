'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { QuestionComponent } from '@/components/exam/QuestionComponent'
import { ExamTimer } from '@/components/exam/ExamTimer'
import { 
  getExamSession, 
  saveAnswer, 
  updateExamSession, 
  calculateScore,
  getExamWithQuestions 
} from '@/lib/exam-service'
import { createClient } from '@/lib/supabase/client'
import type { ExamSession, Question, UserAnswer, ExamWithQuestions } from '@/lib/types'
import { ChevronLeft, ChevronRight, Send, CheckCircle } from 'lucide-react'

export default function ExamPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const supabase = createClient()

  const [session, setSession] = useState<ExamSession | null>(null)
  const [exam, setExam] = useState<ExamWithQuestions | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0) // eslint-disable-line @typescript-eslint/no-unused-vars

  useEffect(() => {
    loadExamSession()
  }, [sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadExamSession = async () => {
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

      // 如果考试已完成，跳转到结果页面
      if (sessionData.is_completed) {
        router.push(`/exam/${sessionId}/result`)
        return
      }

      setSession(sessionData)
      setTimeRemaining(sessionData.time_remaining || 0)

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
      console.error('加载考试会话失败:', error)
      router.push('/exams')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = async (
    questionId: string, 
    answer: { answer_text?: string; selected_options?: string[] }
  ) => {
    try {
      // 保存答案到数据库
      const savedAnswer = await saveAnswer(sessionId, questionId, answer)
      
      // 更新本地状态
      setUserAnswers(prev => ({
        ...prev,
        [questionId]: savedAnswer
      }))
    } catch (error) {
      console.error('保存答案失败:', error)
    }
  }

  const handleTimeUpdate = async (remainingTime: number) => {
    setTimeRemaining(remainingTime)
    
    // 每30秒保存一次剩余时间
    if (remainingTime % 30 === 0) {
      try {
        await updateExamSession(sessionId, { time_remaining: remainingTime })
      } catch (error) {
        console.error('更新剩余时间失败:', error)
      }
    }
  }

  const handleTimeUp = () => {
    handleSubmitExam()
  }

  const handleSubmitExam = async () => {
    if (submitting) return
    
    const confirmed = window.confirm('确定要提交考试吗？提交后将无法修改答案。')
    if (!confirmed) return

    setSubmitting(true)
    
    try {
      // 计算分数并完成考试
      await calculateScore(sessionId)
      
      // 跳转到结果页面
      router.push(`/exam/${sessionId}/result`)
    } catch (error) {
      console.error('提交考试失败:', error)
      alert('提交考试失败，请重试')
      setSubmitting(false)
    }
  }

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const getAnsweredQuestionsCount = () => {
    return Object.keys(userAnswers).length
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">加载考试中...</p>
        </div>
      </div>
    )
  }

  if (!session || !exam || questions.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <h3 className="text-lg font-semibold mb-2">考试不存在</h3>
            <p className="text-muted-foreground mb-4">该考试可能已被删除或您没有权限访问</p>
            <Button onClick={() => router.push('/exams')}>返回考试列表</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="container mx-auto py-4 max-w-4xl">
      {/* 考试头部信息 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{exam.title}</h1>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>总题数：{questions.length} 题</span>
          <span>已答题：{getAnsweredQuestionsCount()} / {questions.length}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 主要内容区域 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 进度条 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">答题进度</span>
                <span className="text-sm text-muted-foreground">
                  {currentQuestionIndex + 1} / {questions.length}
                </span>
              </div>
              <Progress value={progress} className="w-full" />
            </CardContent>
          </Card>

          {/* 当前题目 */}
          <QuestionComponent
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            userAnswer={userAnswers[currentQuestion.id]}
            onAnswerChange={handleAnswerChange}
          />

          {/* 导航按钮 */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              上一题
            </Button>

            <Button
              variant="outline"
              onClick={goToNextQuestion}
              disabled={currentQuestionIndex === questions.length - 1}
            >
              下一题
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 倒计时器 */}
          <ExamTimer
            totalTimeInSeconds={exam.duration_minutes * 60}
            onTimeUp={handleTimeUp}
            onTimeUpdate={handleTimeUpdate}
          />

          {/* 题目导航 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">题目导航</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((question, index) => (
                  <Button
                    key={question.id}
                    variant={index === currentQuestionIndex ? "default" : "outline"}
                    size="sm"
                    className={`relative ${userAnswers[question.id] ? 'border-green-500' : ''}`}
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    {index + 1}
                    {userAnswers[question.id] && (
                      <CheckCircle className="absolute -top-1 -right-1 h-3 w-3 text-green-500 bg-white rounded-full" />
                    )}
                  </Button>
                ))}
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>已答题</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border border-gray-300 rounded"></div>
                  <span>未答题</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 提交按钮 */}
          <Button
            onClick={handleSubmitExam}
            disabled={submitting}
            className="w-full"
            size="lg"
          >
            {submitting ? (
              <>
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                提交中...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                提交考试
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}