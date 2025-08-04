// 简化的API工具类，确保兼容性
export class XingHuoAPI {
  constructor() {
    // 直接使用环境变量，如果没有则使用默认值
    this.baseURL = import.meta.env?.VITE_API_BASE_URL || "https://xingchen-api.xf-yun.com/workflow/v1/chat/completions"
    this.apiKey = import.meta.env?.VITE_API_KEY || "49e7eacaf518a39697317a21692a0cde"
    this.apiSecret = import.meta.env?.VITE_API_SECRET || "NzA3YWQ1YjczNjFmZDgzMmMwOTk4Yjhj"
    this.flowId = import.meta.env?.VITE_API_FLOWID || "7351608093474975746"
  }

  async sendMessage(message, sessionId) {
    try {
      const response = await fetch(this.baseURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}:${this.apiSecret}`,
        },
        body: JSON.stringify({
          flow_id: this.flowId,
          chat_id: sessionId || "default_session",
          question: message,
          stream: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return response
    } catch (error) {
      console.error("API call failed:", error)
      // 返回模拟响应以确保应用正常工作
      return this.getMockResponse(message)
    }
  }

  // 模拟响应，确保应用在API不可用时仍能工作
  getMockResponse(message) {
    const mockResponses = {
      你好: "您好！我是智基灵-云法智擎，您的专业法律助手。请问有什么法律问题需要咨询吗？",
      hello: "Hello! I'm LexPilot AI, your professional legal assistant. How can I help you today?",
      default:
        "感谢您的咨询。由于当前网络连接问题，我暂时无法提供实时回答。请稍后重试，或者您可以描述具体的法律问题，我会尽力为您提供帮助。",
    }

    const response = mockResponses[message.toLowerCase()] || mockResponses.default

    // 创建模拟的流式响应
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        const words = response.split("")
        let index = 0

        const interval = setInterval(() => {
          if (index < words.length) {
            const chunk = `data: ${JSON.stringify({ content: words[index] })}\n\n`
            controller.enqueue(encoder.encode(chunk))
            index++
          } else {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"))
            controller.close()
            clearInterval(interval)
          }
        }, 50)
      },
    })

    return new Response(stream, {
      headers: { "Content-Type": "text/plain" },
    })
  }

  // 同步API调用的备用方案
  async sendMessageSync(message, sessionId) {
    try {
      const response = await fetch(this.baseURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}:${this.apiSecret}`,
        },
        body: JSON.stringify({
          flow_id: this.flowId,
          chat_id: sessionId || "default_session",
          question: message,
          stream: false,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.answer || data.content || "抱歉，我无法回答这个问题。"
    } catch (error) {
      console.error("Sync API call failed:", error)
      // 返回默认回复
      return "感谢您的咨询。我是智基灵-云法智擎，您的专业法律助手。请描述您的具体问题，我会尽力为您提供帮助。"
    }
  }
}
