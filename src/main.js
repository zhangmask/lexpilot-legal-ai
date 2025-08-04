import { getCurrentLang, setCurrentLang, updateTexts } from "./i18n.js"

// Initialize language
const currentLang = getCurrentLang()
setCurrentLang(currentLang)
updateTexts(currentLang)

// Language toggle
document.getElementById("langToggle").addEventListener("click", () => {
  const newLang = getCurrentLang() === "zh" ? "en" : "zh"
  setCurrentLang(newLang)
  updateTexts(newLang)
})

// Start button
document.getElementById("startBtn").addEventListener("click", () => {
  window.location.href = "/chat.html"
})
