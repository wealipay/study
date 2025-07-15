'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatTime } from '@/lib/utils'
import { Clock, AlertTriangle } from 'lucide-react'

interface ExamTimerProps {
  totalTimeInSeconds: number
  onTimeUp: () => void
  onTimeUpdate?: (remainingTime: number) => void
}

export function ExamTimer({
  totalTimeInSeconds,
  onTimeUp,
  onTimeUpdate
}: ExamTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(totalTimeInSeconds)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          const newTime = time - 1
          onTimeUpdate?.(newTime)
          
          if (newTime <= 0) {
            setIsActive(false)
            onTimeUp()
            return 0
          }
          
          return newTime
        })
      }, 1000)
    } else if (timeRemaining <= 0) {
      setIsActive(false)
      onTimeUp()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeRemaining, onTimeUp, onTimeUpdate])

  const progress = ((totalTimeInSeconds - timeRemaining) / totalTimeInSeconds) * 100
  const isNearEnd = timeRemaining <= 300 // 最后5分钟
  const isCritical = timeRemaining <= 60 // 最后1分钟

  const getTimerColor = () => {
    if (isCritical) return 'text-red-600'
    if (isNearEnd) return 'text-orange-600'
    return 'text-green-600'
  }

  // const getProgressColor = () => {
  //   if (isCritical) return 'bg-red-500'
  //   if (isNearEnd) return 'bg-orange-500'
  //   return 'bg-green-500'
  // }

  return (
    <Card className={`w-full ${isCritical ? 'border-red-200 bg-red-50' : isNearEnd ? 'border-orange-200 bg-orange-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isCritical ? (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            ) : (
              <Clock className="h-5 w-5 text-muted-foreground" />
            )}
            <span className="text-sm font-medium text-muted-foreground">
              剩余时间
            </span>
          </div>
          <div className={`text-2xl font-bold ${getTimerColor()}`}>
            {formatTime(timeRemaining)}
          </div>
        </div>
        
        <div className="space-y-2">
          <Progress 
            value={progress} 
            className="w-full h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>已用时间: {formatTime(totalTimeInSeconds - timeRemaining)}</span>
            <span>总时间: {formatTime(totalTimeInSeconds)}</span>
          </div>
        </div>

        {isCritical && (
          <div className="mt-3 text-xs text-red-600 font-medium text-center animate-pulse">
            ⚠️ 时间不足1分钟，请尽快完成答题！
          </div>
        )}
        {isNearEnd && !isCritical && (
          <div className="mt-3 text-xs text-orange-600 font-medium text-center">
            ⏰ 剩余时间不足5分钟，请注意时间！
          </div>
        )}
      </CardContent>
    </Card>
  )
}