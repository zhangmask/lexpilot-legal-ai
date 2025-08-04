import { getCurrentLang, setCurrentLang, updateTexts } from "./i18n.js"
import { XingHuoAPI } from "./api.js"

class ChatApp {
  constructor() {
    this.currentSessionId = null
    this.sessions = this.loadSessions()
    this.isLoading = false
    this.api = new XingHuoAPI()

    this.init()
  }

  init() {
    // Initialize language
    const currentLang = getCurrentLang()
    setCurrentLang(currentLang)
    updateTexts(currentLang)

    // Set input placeholder
    this.updateInputPlaceholder()

    // Event listeners
    this.setupEventListeners()

    // Load session from URL or create new
    this.handleInitialLoad()

    // Render sessions
    this.renderSessions()
  }

  updateInputPlaceholder() {
    const lang = getCurrentLang()
    const placeholder = lang === "zh" ? "请输入法律或办事问题…" : "Type your legal question…"
    document.getElementById("messageInput").placeholder = placeholder
  }

  setupEventListeners() {
    // Language toggle
    document.getElementById("langToggle").addEventListener("click", () => {
      const newLang = getCurrentLang() === "zh" ? "en" : "zh"
      setCurrentLang(newLang)
      updateTexts(newLang)
      this.updateInputPlaceholder()
    })

    // New chat button
    document.getElementById("newChatBtn").addEventListener("click", () => {
      this.createNewSession()
    })

    // Send button
    document.getElementById("sendBtn").addEventListener("click", () => {
      this.sendMessage()
    })

    // Input handling
    const messageInput = document.getElementById("messageInput")
    messageInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        this.sendMessage()
      }
    })

    // Auto-resize textarea
    messageInput.addEventListener("input", () => {
      this.autoResizeTextarea(messageInput)
    })
  }

  autoResizeTextarea(textarea) {
    textarea.style.height = "auto"
    const maxHeight = 120 // 5 rows approximately
    const newHeight = Math.min(textarea.scrollHeight, maxHeight)
    textarea.style.height = newHeight + "px"
  }

  handleInitialLoad() {
    const urlParams = new URLSearchParams(window.location.search)
    const sessionId = urlParams.get("id")

    if (sessionId && this.sessions.find((s) => s.id === sessionId)) {
      this.loadSession(sessionId)
    } else {
      this.createNewSession()
    }
  }

  createNewSession() {
    const sessionId = "session_" + Date.now()
    const newSession = {
      id: sessionId,
      title: getCurrentLang() === "zh" ? "新对话" : "New Chat",
      messages: [],
      createdAt: new Date().toISOString(),
    }

    this.sessions.unshift(newSession)
    this.saveSessions()
    this.loadSession(sessionId)
    this.renderSessions()

    // Update URL
    window.history.pushState({}, "", `/chat.html?id=${sessionId}`)
  }

  loadSession(sessionId) {
    this.currentSessionId = sessionId
    const session = this.sessions.find((s) => s.id === sessionId)

    if (session) {
      this.renderMessages(session.messages)
      this.highlightActiveSession(sessionId)
    }
  }

  async sendMessage() {
    if (this.isLoading) return

    const messageInput = document.getElementById("messageInput")
    const message = messageInput.value.trim()

    if (!message) return

    // Clear input
    messageInput.value = ""
    messageInput.style.height = "auto"

    // Add user message
    this.addMessage("user", message)

    // Show loading
    this.setLoading(true)

    try {
      // Call API
      await this.callAPI(message)
    } catch (error) {
      console.error("API Error:", error)
      const errorMsg =
        getCurrentLang() === "zh"
          ? "抱歉，出现了一些问题，请稍后重试"
          : "Sorry, something went wrong. Please try again later"
      this.addMessage("assistant", errorMsg)
    } finally {
      this.setLoading(false)
    }
  }

  async callAPI(message) {
    try {
      const response = await this.api.sendMessage(message, this.currentSessionId)

      // Handle streaming response
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ""
      let messageElement = null

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim()
              if (data === "[DONE]" || !data) continue

              try {
                const parsed = JSON.parse(data)
                const content = parsed.content || parsed.answer || parsed.text || ""

                if (content) {
                  assistantMessage += content

                  // Update or create message element
                  if (!messageElement) {
                    messageElement = this.addMessage("assistant", assistantMessage, true)
                  } else {
                    this.updateMessage(messageElement, assistantMessage)
                  }
                }
              } catch (e) {
                // 如果是纯文本内容，直接添加
                if (data && !data.startsWith('{')) {
                  assistantMessage += data
                  if (!messageElement) {
                    messageElement = this.addMessage("assistant", assistantMessage, true)
                  } else {
                    this.updateMessage(messageElement, assistantMessage)
                  }
                }
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

      // Save final message
      if (assistantMessage) {
        this.saveMessageToSession("assistant", assistantMessage)
      } else {
        // 如果没有收到流式响应，使用同步API
        try {
          const fallbackResponse = await this.api.sendMessageSync(message, this.currentSessionId)
          if (!messageElement) {
            this.addMessage("assistant", fallbackResponse)
          } else {
            this.updateMessage(messageElement, fallbackResponse)
          }
          this.saveMessageToSession("assistant", fallbackResponse)
        } catch (syncError) {
          const errorMsg = getCurrentLang() === "zh"
            ? "您好！我是智基灵-云法智擎，您的专业法律助手。请问有什么法律问题需要咨询吗？"
            : "Hello! I'm LexPilot AI, your professional legal assistant. How can I help you today?"
          
          if (!messageElement) {
            this.addMessage("assistant", errorMsg)
          } else {
            this.updateMessage(messageElement, errorMsg)
          }
          this.saveMessageToSession("assistant", errorMsg)
        }
      }
    } catch (error) {
      console.error("API Error:", error)
      const welcomeMsg = getCurrentLang() === "zh"
        ? "您好！我是智基灵-云法智擎，您的专业法律助手。虽然当前网络连接有些问题，但我仍然可以为您提供基本的法律咨询服务。请告诉我您的问题。"
        : "Hello! I'm LexPilot AI, your professional legal assistant. Although there are some network issues, I can still provide basic legal consultation services. Please tell me your question."
      
      this.addMessage("assistant", welcomeMsg)
      this.saveMessageToSession("assistant", welcomeMsg)
    }
  }

  addMessage(role, content, isStreaming = false) {
    const messagesContainer = document.getElementById("messagesContainer")

    // Hide welcome message
    const welcomeMessage = document.getElementById("welcomeMessage")
    if (welcomeMessage) {
      welcomeMessage.style.display = "none"
    }

    // Create message element
    const messageDiv = document.createElement("div")
    messageDiv.className = `message-animation flex ${role === "user" ? "justify-end" : "justify-start"} mb-4`

    const messageContent = document.createElement("div")
    messageContent.className = `max-w-3xl px-4 py-3 rounded-xl ${
      role === "user"
        ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white ml-12"
        : "bg-slate-200 text-slate-800 mr-12"
    }`

    // Add avatar
    const avatar = document.createElement("div")
    avatar.className = `w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
      role === "user" ? "bg-sky-600 ml-3 order-2" : "bg-slate-400 mr-3"
    }`

    if (role === "user") {
      avatar.textContent = "U"
      avatar.className += " text-white text-sm font-semibold"
    } else {
      avatar.innerHTML = `
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
        </svg>
      `
    }

    messageContent.textContent = content

    messageDiv.appendChild(avatar)
    messageDiv.appendChild(messageContent)
    messagesContainer.appendChild(messageDiv)

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight

    // Save to session if not streaming
    if (!isStreaming) {
      this.saveMessageToSession(role, content)
      this.updateSessionTitle(content, role)
    }

    return messageContent
  }

  updateMessage(messageElement, content) {
    messageElement.textContent = content

    // Scroll to bottom
    const messagesContainer = document.getElementById("messagesContainer")
    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }

  saveMessageToSession(role, content) {
    const session = this.sessions.find((s) => s.id === this.currentSessionId)
    if (session) {
      session.messages.push({ role, content, timestamp: new Date().toISOString() })
      this.saveSessions()
    }
  }

  updateSessionTitle(content, role) {
    if (role === "user") {
      const session = this.sessions.find((s) => s.id === this.currentSessionId)
      if (session && session.messages.length <= 2) {
        // Only update for first user message
        session.title = content.substring(0, 20) + (content.length > 20 ? "..." : "")
        this.saveSessions()
        this.renderSessions()
      }
    }
  }

  renderMessages(messages) {
    const messagesContainer = document.getElementById("messagesContainer")

    // Clear existing messages except welcome
    const existingMessages = messagesContainer.querySelectorAll(".message-animation")
    existingMessages.forEach((msg) => msg.remove())

    if (messages.length === 0) {
      document.getElementById("welcomeMessage").style.display = "block"
    } else {
      document.getElementById("welcomeMessage").style.display = "none"
      messages.forEach((msg) => {
        this.addMessage(msg.role, msg.content)
      })
    }
  }

  renderSessions() {
    const sessionList = document.getElementById("sessionList")
    sessionList.innerHTML = ""

    this.sessions.forEach((session) => {
      const sessionDiv = document.createElement("div")
      sessionDiv.className = `p-3 rounded-lg cursor-pointer transition-colors hover:bg-slate-700/50 ${
        session.id === this.currentSessionId ? "bg-slate-700/70" : ""
      }`
      sessionDiv.onclick = () => this.switchSession(session.id)

      const title = document.createElement("div")
      title.className = "text-white text-sm font-medium truncate"
      title.textContent = session.title

      const date = document.createElement("div")
      date.className = "text-slate-400 text-xs mt-1"
      date.textContent = new Date(session.createdAt).toLocaleDateString()

      sessionDiv.appendChild(title)
      sessionDiv.appendChild(date)
      sessionList.appendChild(sessionDiv)
    })
  }

  switchSession(sessionId) {
    this.loadSession(sessionId)
    window.history.pushState({}, "", `/chat.html?id=${sessionId}`)
  }

  highlightActiveSession(sessionId) {
    const sessionElements = document.querySelectorAll("#sessionList > div")
    sessionElements.forEach((el, index) => {
      if (this.sessions[index].id === sessionId) {
        el.className = el.className.replace("bg-slate-700/70", "").trim() + " bg-slate-700/70"
      } else {
        el.className = el.className.replace("bg-slate-700/70", "").trim()
      }
    })
  }

  setLoading(loading) {
    this.isLoading = loading
    const sendBtn = document.getElementById("sendBtn")
    const messageInput = document.getElementById("messageInput")

    sendBtn.disabled = loading
    messageInput.disabled = loading

    if (loading) {
      // 添加加载指示器而不是消息
      this.showLoadingIndicator()
    } else {
      this.hideLoadingIndicator()
    }
  }

  showLoadingIndicator() {
    const messagesContainer = document.getElementById("messagesContainer")

    const loadingDiv = document.createElement("div")
    loadingDiv.id = "loadingIndicator"
    loadingDiv.className = "flex justify-start mb-4"

    const avatar = document.createElement("div")
    avatar.className = "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-400 mr-3"
    avatar.innerHTML = `
      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
      </svg>
    `

    const loadingContent = document.createElement("div")
    loadingContent.className = "max-w-3xl px-4 py-3 rounded-xl bg-slate-200 text-slate-800 mr-12"

    const dots = document.createElement("div")
    dots.className = "flex space-x-1"
    dots.innerHTML = `
      <div class="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
      <div class="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
      <div class="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
    `

    loadingContent.appendChild(dots)
    loadingDiv.appendChild(avatar)
    loadingDiv.appendChild(loadingContent)
    messagesContainer.appendChild(loadingDiv)

    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }

  hideLoadingIndicator() {
    const loadingIndicator = document.getElementById("loadingIndicator")
    if (loadingIndicator) {
      loadingIndicator.remove()
    }
  }

  loadSessions() {
    const saved = localStorage.getItem("chatSessions")
    return saved ? JSON.parse(saved) : []
  }

  saveSessions() {
    // Keep only last 20 sessions
    if (this.sessions.length > 20) {
      this.sessions = this.sessions.slice(0, 20)
    }
    localStorage.setItem("chatSessions", JSON.stringify(this.sessions))
  }
}

// Initialize app
new ChatApp()
