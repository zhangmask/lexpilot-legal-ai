import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "消息不能为空" }, { status: 400 })
    }

    console.log("收到聊天请求:", { message, historyLength: history.length })

    // 构建请求数据
    const requestData = {
      header: {
        app_id: "7351608093474975746",
        uid: "user_" + Date.now(),
      },
      parameter: {
        chat: {
          domain: "generalv3.5",
          temperature: 0.7,
          max_tokens: 2048,
        },
      },
      payload: {
        message: {
          text: [
            {
              role: "system",
              content:
                "你是一个专业的AI法律助手，名叫LexPilot AI（智基灵云法智擎）。你具备丰富的法律知识，能够为用户提供准确、专业的法律咨询服务。请用中文回答问题，语言要专业但易懂。",
            },
            ...history.slice(-8).map((msg: any) => ({
              role: msg.role === "user" ? "user" : "assistant",
              content: msg.content,
            })),
            {
              role: "user",
              content: message,
            },
          ],
        },
      },
    }

    console.log("发送到讯飞API的数据:", JSON.stringify(requestData, null, 2))

    // 创建流式响应
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 调用讯飞API
          const response = await fetch("https://spark-api-open.xf-yun.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.XINGHUO_API_KEY}:${process.env.XINGHUO_API_SECRET}`,
            },
            body: JSON.stringify({
              model: "generalv3.5",
              messages: requestData.payload.message.text,
              stream: true,
              temperature: 0.7,
              max_tokens: 2048,
            }),
          })

          if (!response.ok) {
            const errorText = await response.text()
            console.error("讯飞API错误:", response.status, errorText)

            // 发送错误信息
            const errorMessage = `抱歉，我现在无法回复您的问题。API错误: ${response.status}`
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: errorMessage })}\n\n`))
            controller.enqueue(encoder.encode("data: [DONE]\n\n"))
            controller.close()
            return
          }

          const reader = response.body?.getReader()
          if (!reader) {
            throw new Error("无法读取响应流")
          }

          const decoder = new TextDecoder()
          let buffer = ""

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split("\n")
            buffer = lines.pop() || ""

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim()
                if (data === "[DONE]") {
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"))
                  controller.close()
                  return
                }

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content

                  if (content) {
                    console.log("收到内容片段:", content)
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
                  }
                } catch (e) {
                  console.log("跳过非JSON行:", data)
                }
              }
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        } catch (error) {
          console.error("流式处理错误:", error)

          // 发送备用回复
          const fallbackMessage =
            "抱歉，我现在无法正常回复。这可能是网络问题或服务暂时不可用。请稍后再试，或者尝试重新表述您的问题。"
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: fallbackMessage })}\n\n`))
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("API路由错误:", error)
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
  }
}

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
