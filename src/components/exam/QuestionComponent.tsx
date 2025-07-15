'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
// import { Button } from '@/components/ui/button' // Not used currently
import type { Question, UserAnswer } from '@/lib/types'

interface QuestionComponentProps {
  question: Question
  questionNumber: number
  userAnswer?: UserAnswer
  onAnswerChange: (questionId: string, answer: {
    answer_text?: string
    selected_options?: string[]
  }) => void
  disabled?: boolean
}

export function QuestionComponent({
  question,
  questionNumber,
  userAnswer,
  onAnswerChange,
  disabled = false
}: QuestionComponentProps) {
  const [fillBlankAnswer, setFillBlankAnswer] = useState('')
  const [singleChoiceAnswer, setSingleChoiceAnswer] = useState('')
  const [multipleChoiceAnswers, setMultipleChoiceAnswers] = useState<string[]>([])

  // 初始化答案
  useEffect(() => {
    if (userAnswer) {
      if (question.question_type === 'fill_blank') {
        setFillBlankAnswer(userAnswer.answer_text || '')
      } else if (question.question_type === 'single_choice') {
        setSingleChoiceAnswer(userAnswer.selected_options?.[0] || '')
      } else if (question.question_type === 'multiple_choice') {
        setMultipleChoiceAnswers(userAnswer.selected_options || [])
      }
    }
  }, [userAnswer, question.question_type])

  const handleFillBlankChange = (value: string) => {
    setFillBlankAnswer(value)
    onAnswerChange(question.id, { answer_text: value })
  }

  const handleSingleChoiceChange = (value: string) => {
    setSingleChoiceAnswer(value)
    onAnswerChange(question.id, { selected_options: [value] })
  }

  const handleMultipleChoiceChange = (option: string, checked: boolean) => {
    const newAnswers = checked
      ? [...multipleChoiceAnswers, option]
      : multipleChoiceAnswers.filter(answer => answer !== option)
    
    setMultipleChoiceAnswers(newAnswers)
    onAnswerChange(question.id, { selected_options: newAnswers })
  }

  const renderFillBlank = () => {
    const parts = question.question_text.split('______')
    return (
      <div className="space-y-4">
        <div className="text-base leading-relaxed">
          {parts.map((part, index) => (
            <React.Fragment key={index}>
              {part}
              {index < parts.length - 1 && (
                <Input
                  type="text"
                  value={fillBlankAnswer}
                  onChange={(e) => handleFillBlankChange(e.target.value)}
                  disabled={disabled}
                  className="inline-block w-32 mx-2"
                  placeholder="填写答案"
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }

  const renderSingleChoice = () => (
    <div className="space-y-4">
      <p className="text-base leading-relaxed">{question.question_text}</p>
      <RadioGroup
        value={singleChoiceAnswer}
        onValueChange={handleSingleChoiceChange}
        disabled={disabled}
        className="space-y-3"
      >
        {question.options?.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <RadioGroupItem value={option} id={`${question.id}-${index}`} />
            <Label
              htmlFor={`${question.id}-${index}`}
              className="text-sm font-normal cursor-pointer flex-1"
            >
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )

  const renderMultipleChoice = () => (
    <div className="space-y-4">
      <p className="text-base leading-relaxed">{question.question_text}</p>
      <div className="space-y-3">
        {question.options?.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`${question.id}-${index}`}
              checked={multipleChoiceAnswers.includes(option)}
              onChange={(e) => handleMultipleChoiceChange(option, e.target.checked)}
              disabled={disabled}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label
              htmlFor={`${question.id}-${index}`}
              className="text-sm font-normal cursor-pointer flex-1"
            >
              {option}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )

  const getQuestionTypeLabel = () => {
    switch (question.question_type) {
      case 'fill_blank':
        return '填空题'
      case 'single_choice':
        return '单选题'
      case 'multiple_choice':
        return '多选题'
      default:
        return ''
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>第 {questionNumber} 题</span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
              {getQuestionTypeLabel()}
            </span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
              {question.points} 分
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {question.question_type === 'fill_blank' && renderFillBlank()}
        {question.question_type === 'single_choice' && renderSingleChoice()}
        {question.question_type === 'multiple_choice' && renderMultipleChoice()}
      </CardContent>
    </Card>
  )
}