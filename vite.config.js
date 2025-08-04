import { defineConfig } from "vite"

export default defineConfig({
  server: {
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        chat: "chat.html",
        test: "test.html",
      },
    },
  },
})
