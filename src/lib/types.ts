export interface Database {
  public: {
    Tables: {
      exams: {
        Row: {
          id: string
          title: string
          description: string | null
          duration_minutes: number
          total_points: number
          is_active: boolean
          created_at: string
          created_by: string
          passing_score: number
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          duration_minutes: number
          total_points?: number
          is_active?: boolean
          created_at?: string
          created_by: string
          passing_score?: number
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          duration_minutes?: number
          total_points?: number
          is_active?: boolean
          created_at?: string
          created_by?: string
          passing_score?: number
        }
      }
      questions: {
        Row: {
          id: string
          exam_id: string
          question_text: string
          question_type: 'fill_blank' | 'multiple_choice' | 'single_choice'
          points: number
          order_index: number
          correct_answer: string | null
          options: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          exam_id: string
          question_text: string
          question_type: 'fill_blank' | 'multiple_choice' | 'single_choice'
          points?: number
          order_index: number
          correct_answer?: string | null
          options?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          exam_id?: string
          question_text?: string
          question_type?: 'fill_blank' | 'multiple_choice' | 'single_choice'
          points?: number
          order_index?: number
          correct_answer?: string | null
          options?: string[] | null
          created_at?: string
        }
      }
      exam_sessions: {
        Row: {
          id: string
          exam_id: string
          user_id: string
          started_at: string
          ended_at: string | null
          total_score: number | null
          max_score: number
          is_completed: boolean
          answers: Record<string, unknown>
          time_remaining: number | null
        }
        Insert: {
          id?: string
          exam_id: string
          user_id: string
          started_at?: string
          ended_at?: string | null
          total_score?: number | null
          max_score: number
          is_completed?: boolean
          answers?: Record<string, unknown>
          time_remaining?: number | null
        }
        Update: {
          id?: string
          exam_id?: string
          user_id?: string
          started_at?: string
          ended_at?: string | null
          total_score?: number | null
          max_score?: number
          is_completed?: boolean
          answers?: Record<string, unknown>
          time_remaining?: number | null
        }
      }
      user_answers: {
        Row: {
          id: string
          session_id: string
          question_id: string
          answer_text: string | null
          selected_options: string[] | null
          is_correct: boolean
          points_earned: number
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          question_id: string
          answer_text?: string | null
          selected_options?: string[] | null
          is_correct?: boolean
          points_earned?: number
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          question_id?: string
          answer_text?: string | null
          selected_options?: string[] | null
          is_correct?: boolean
          points_earned?: number
          created_at?: string
        }
      }
    }
  }
}

export type Exam = Database['public']['Tables']['exams']['Row']
export type Question = Database['public']['Tables']['questions']['Row']
export type ExamSession = Database['public']['Tables']['exam_sessions']['Row']
export type UserAnswer = Database['public']['Tables']['user_answers']['Row']

export interface ExamWithQuestions extends Exam {
  questions: Question[]
}

export interface ExamSessionWithDetails extends ExamSession {
  exam: Exam
  user_answers: UserAnswer[]
}

export interface QuestionWithAnswer extends Question {
  userAnswer?: UserAnswer
}