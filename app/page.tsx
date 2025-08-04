import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageSquare, Scale, Zap, Globe } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Scale className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">LexPilot AI</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost">关于我们</Button>
            <Button variant="ghost">联系我们</Button>
            <Link href="/chat">
              <Button>开始使用</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            智基灵 - 云法智擎
            <span className="block text-blue-600 mt-2">AI法律助手</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            基于先进的人工智能技术，为您提供专业、准确、高效的法律咨询服务。
            支持中英双语，实时流式回复，让法律咨询变得更加智能便捷。
          </p>

          <div className="flex justify-center space-x-4 mb-12">
            <Link href="/chat">
              <Button size="lg" className="px-8 py-3">
                <MessageSquare className="mr-2 h-5 w-5" />
                立即体验
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-3 bg-transparent">
              <Globe className="mr-2 h-5 w-5" />
              了解更多
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">实时流式回复</h3>
              <p className="text-gray-600">
                采用最新的流式输出技术，像ChatGPT一样实时显示回复内容，提供流畅的交互体验。
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">中英双语支持</h3>
              <p className="text-gray-600">完美支持中文和英文法律咨询，满足不同用户的语言需求，提供本地化服务。</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <Scale className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">专业法律知识</h3>
              <p className="text-gray-600">基于讯飞星火大模型，具备丰富的法律知识库，能够处理各类法律问题和咨询。</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 LexPilot AI. 智基灵云法智擎 - 让法律咨询更智能</p>
        </div>
      </footer>
    </div>
  )
}
