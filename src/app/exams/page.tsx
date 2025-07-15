'use client'

import React, { useEffect, useState } from 'react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createExamSession } from '@/lib/exam-service'
import { createClient } from '@/lib/supabase/client'
import type { Exam } from '@/lib/types'
import { Clock, FileText, Target, Users } from 'lucide-react'

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [startingExam, setStartingExam] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadExams()
  }, [])

  const loadExams = async () => {
    try {
      const data = await getExams()
      setExams(data)
    } catch (error) {
      console.error('加载考试列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartExam = async (examId: string) => {
    try {
      setStartingExam(examId)
      
      // 获取当前用户
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // 创建考试会话
      const session = await createExamSession(examId, user.id)
      
      // 跳转到考试页面
      router.push(`/exam/${session.id}`)
    } catch (error) {
      console.error('开始考试失败:', error)
      alert('开始考试失败，请重试')
    } finally {
      setStartingExam(null)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">加载考试列表中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">在线考试系统</h1>
        <p className="text-muted-foreground">选择一个考试开始测试</p>
      </div>

      {exams.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">暂无可用考试</h3>
            <p className="text-muted-foreground">请稍后再来查看</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {exam.title}
                </CardTitle>
                {exam.description && (
                  <CardDescription>{exam.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>考试时长：{exam.duration_minutes} 分钟</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    <span>总分：{exam.total_points} 分</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>及格分：{exam.passing_score} 分</span>
                  </div>
                </div>
                
                <Button
                  onClick={() => handleStartExam(exam.id)}
                  disabled={startingExam === exam.id}
                  className="w-full"
                >
                  {startingExam === exam.id ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      开始考试...
                    </>
                  ) : (
                    '开始考试'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}