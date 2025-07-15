import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import Link from 'next/link'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase is not configured, show configuration page
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your_supabase_url')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-8">
              Welcome to Next.js 15 + Supabase + Tailwind CSS v4
            </h1>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-yellow-800 mb-4">🔧 Configuration Required</h2>
              <p className="text-yellow-700 mb-4">
                To get started, you need to configure your Supabase credentials:
              </p>
              <ol className="list-decimal list-inside text-yellow-700 space-y-2">
                <li>Create a new project at <a href="https://supabase.com" className="underline">supabase.com</a></li>
                <li>Copy your project URL and API keys</li>
                <li>Update the <code className="bg-yellow-100 px-1 rounded">.env.local</code> file with your credentials</li>
                <li>Restart the development server</li>
              </ol>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-700">Project Features</h2>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Next.js 15 with App Router
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Supabase Authentication
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Tailwind CSS v4
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    TypeScript Support
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Server-Side Rendering
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-700">Quick Start</h2>
                <div className="bg-gray-50 p-4 rounded-md">
                  <pre className="text-sm text-gray-600">
                    <code>{`# Update .env.local with your values:
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_secret`}</code>
                  </pre>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-md">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Next Steps</h3>
              <p className="text-blue-700">
                                 Once configured, you&apos;ll have access to user authentication, database operations, 
                 and all the power of Supabase integrated with your Next.js application.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">
              Welcome to Next.js 15 + Supabase + Tailwind CSS v4
            </h1>
            <LogoutButton />
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-700">User Information</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Last Sign In:</strong> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-700">Project Features</h2>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Next.js 15 with App Router
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Supabase Authentication
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Tailwind CSS v4
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  TypeScript Support
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Server-Side Rendering
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-green-50 rounded-md">
            <h3 className="text-lg font-medium text-green-800 mb-4">在线考试系统</h3>
            <p className="text-green-700 mb-4">
              欢迎使用在线考试系统！这是一个完整的考试解决方案，支持填空题、单选题和多选题，并能自动计算分数。
            </p>
            <Link href="/exams">
              <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                开始考试 →
              </button>
            </Link>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-md">
            <h3 className="text-lg font-medium text-blue-800 mb-2">功能特点</h3>
            <ul className="text-blue-700 space-y-1">
              <li>• 支持填空题、单选题、多选题</li>
              <li>• 实时计时器，自动提交</li>
              <li>• 考试结束后自动计算分数</li>
              <li>• 详细的答题分析和结果展示</li>
              <li>• 响应式设计，支持移动设备</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
