# LexPilot AI - 智基灵云法智擎

专业的AI法律助手，基于讯飞星火大模型，提供智能法律咨询服务。

## 🚀 功能特点

- ✅ **实时流式回复** - 像ChatGPT一样的打字效果
- ✅ **专业法律知识** - 基于讯飞星火大模型
- ✅ **中英双语支持** - 完美支持中文和英文
- ✅ **响应式设计** - 适配各种设备
- ✅ **简洁易用** - 直观的聊天界面

## 🛠️ 技术栈

- **前端**: Next.js 14, React 18, TypeScript
- **样式**: Tailwind CSS
- **UI组件**: Radix UI
- **AI模型**: 讯飞星火大模型
- **部署**: Vercel

## 📦 快速开始

### 1. 克隆项目
\`\`\`bash
git clone https://github.com/your-username/lexpilot-legal-ai.git
cd lexpilot-legal-ai
\`\`\`

### 2. 安装依赖
\`\`\`bash
npm install
\`\`\`

### 3. 配置环境变量
创建 `.env.local` 文件：
\`\`\`env
XINGHUO_API_KEY=your_api_key
XINGHUO_API_SECRET=your_api_secret
XINGHUO_FLOW_ID=your_flow_id
\`\`\`

### 4. 启动开发服务器
\`\`\`bash
npm run dev
\`\`\`

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🌐 部署

### 部署到 Vercel

1. 推送代码到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 设置环境变量
4. 点击部署

### 环境变量设置

在 Vercel 项目设置中添加以下环境变量：

\`\`\`
XINGHUO_API_KEY=49e7eacaf518a39697317a21692a0cde
XINGHUO_API_SECRET=NzA3YWQ1YjczNjFmZDgzMmMwOTk4Yjhj
XINGHUO_FLOW_ID=7351608093474975746
\`\`\`

## 📱 使用说明

1. 访问首页了解产品特性
2. 点击"立即体验"进入聊天界面
3. 输入您的法律问题
4. 享受实时流式回复体验

## 🔧 开发

### 项目结构
\`\`\`
├── app/                 # Next.js App Router
│   ├── api/chat/       # API路由
│   ├── chat/           # 聊天页面
│   ├── globals.css     # 全局样式
│   ├── layout.tsx      # 根布局
│   └── page.tsx        # 首页
├── components/ui/      # UI组件
├── lib/               # 工具函数
└── public/            # 静态资源
\`\`\`

### 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run start` - 启动生产服务器
- `npm run lint` - 运行ESLint检查

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**LexPilot AI** - 让法律咨询更智能 🚀
