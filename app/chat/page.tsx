"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // 创建助手消息
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: "",
      role: "assistant",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, assistantMessage])

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-10), // 只发送最近10条消息作为上下文
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("无法读取响应流")
      }

      const decoder = new TextDecoder()
      let accumulatedContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") {
              break
            }

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                accumulatedContent += parsed.content

                // 更新助手消息
                setMessages((prev) =>
                  prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: accumulatedContent } : msg)),
                )
              }
            } catch (e) {
              // 忽略解析错误，继续处理下一行
            }
          }
        }
      }
    } catch (error) {
      console.error("聊天错误:", error)

      // 更新助手消息为错误信息
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                content: "抱歉，我现在无法回复您的问题。请稍后再试，或检查网络连接。",
              }
            : msg,
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回首页
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">LexPilot AI 法律助手</h1>
          </div>
          <div className="text-sm text-gray-500">智基灵云法智擎 - 实时流式回复</div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">欢迎使用 LexPilot AI 法律助手</h3>
              <p className="text-gray-500">
                我是您的专业AI法律顾问，可以为您提供法律咨询、案例分析、法条解释等服务。
                <br />
                请输入您的法律问题，我将为您提供专业的解答。
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex max-w-3xl ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`flex-shrink-0 ${message.role === "user" ? "ml-3" : "mr-3"}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                </div>
                <div
                  className={`px-4 py-3 rounded-lg ${
                    message.role === "user" ? "bg-blue-600 text-white" : "bg-white text-gray-900 border border-gray-200"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.role === "assistant" && isLoading && message.content === "" && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="请输入您的法律问题..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <div className="text-xs text-gray-500 mt-2 text-center">LexPilot AI 可能会出错。请核实重要信息。</div>
        </div>
      </div>
    </div>
  )
}
