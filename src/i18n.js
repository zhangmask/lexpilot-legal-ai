export const dict = {
  zh: {
    // Index page
    mainTitle: "智基灵-云法智擎",
    subtitle: "法律问答 · 办事流程 · 一问即答",
    startBtnText: "立即体验",

    // Chat page
    sidebarTitle: "会话历史",
    newChatText: "新建对话",
    chatTitle: "智基灵-云法智擎",
    chatSubtitle: "您的专业法律助手",
    welcomeTitle: "欢迎使用智基灵-云法智擎",
    welcomeDesc: "请输入您的法律问题或办事流程咨询，我将为您提供专业解答",
    inputPlaceholder: "请输入法律或办事问题…",

    // Common
    loading: "正在思考中...",
    error: "抱歉，出现了一些问题，请稍后重试",
    newSession: "新对话",
  },
  en: {
    // Index page
    mainTitle: "LexPilot AI",
    subtitle: "Legal Q&A · Process Guide · Instant Answers",
    startBtnText: "Start Now",

    // Chat page
    sidebarTitle: "Chat History",
    newChatText: "New Chat",
    chatTitle: "LexPilot AI",
    chatSubtitle: "Your Professional Legal Assistant",
    welcomeTitle: "Welcome to LexPilot AI",
    welcomeDesc: "Please enter your legal questions or process inquiries, and I will provide professional answers",
    inputPlaceholder: "Type your legal question…",

    // Common
    loading: "Thinking...",
    error: "Sorry, something went wrong. Please try again later",
    newSession: "New Chat",
  },
}

export function getCurrentLang() {
  return localStorage.getItem("lang") || "zh"
}

export function setCurrentLang(lang) {
  localStorage.setItem("lang", lang)
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en"
}

export function updateTexts(lang) {
  const texts = dict[lang]
  Object.keys(texts).forEach((key) => {
    const element = document.getElementById(key)
    if (element) {
      if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
        element.placeholder = texts[key]
      } else {
        element.textContent = texts[key]
      }
    }
  })
}
