# better DEV UI

> Modern, real-time AI chat interface built with React 19, TypeScript, and AI SDK v5

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [Development](#-development)
- [Build & Deployment](#-build--deployment)
- [Environment Variables](#-environment-variables)
- [Key Features Deep Dive](#-key-features-deep-dive)
- [Contributing](#-contributing)

---

## 🌟 Overview

better DEV UI is a production-ready, modern chat interface for AI conversations. Built with the latest web technologies, it provides a seamless, real-time experience with streaming responses, tool visibility, and conversation management.

**Live Demo:** [Your Frontend URL]

**Backend Repository:** [better-dev-api](https://github.com/Kashif-Rezwi/better-dev-api)

---

## ✨ Features

### 🎨 **User Experience**
- **Real-time Streaming** - See AI responses as they're generated with smooth animations
- **Tool Call Visibility** - Watch the AI use tools like web search in real-time
- **Dark Mode UI** - Beautiful, eye-friendly dark interface with orange accents
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Smart Scrolling** - Auto-scroll to new messages with manual control

### 💬 **Chat Features**
- **Conversation Management** - Create, view, and delete conversations
- **System Prompts** - Customize AI behavior per conversation
- **Message History** - Persistent chat history with timestamps
- **Auto-Title Generation** - AI generates conversation titles automatically
- **Rich Markdown** - Full markdown support with code highlighting

### 🔧 **Technical Features**
- **Optimistic Updates** - Instant UI feedback before server response
- **Smart Caching** - TanStack Query for efficient data management
- **Error Boundaries** - Graceful error handling and recovery
- **Type Safety** - Full TypeScript coverage
- **State Management** - Clean, organized React hooks architecture

---

## 🛠️ Tech Stack

### **Core**
- **React 19** - Latest React with concurrent features
- **TypeScript 5.9** - Type-safe development
- **Vite 7.1** - Lightning-fast dev server and builds

### **UI & Styling**
- **TailwindCSS 4.1** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **shadcn/ui patterns** - Pre-styled Radix components
- **React Markdown** - Markdown rendering for chat messages
- **Lucide React** - Beautiful icon library

### **State Management**
- **TanStack Query v5** - Server state management
- **React Hook Form** - Form state and validation
- **AI SDK v5** (Vercel) - Streaming AI responses

### **API & Communication**
- **Axios** - HTTP client with interceptors
- **Server-Sent Events (SSE)** - Real-time streaming

### **Development**
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting
- **Sonner** - Toast notifications

---

## 📦 Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** or **yarn** or **pnpm**
- **Backend API** running (see [better-dev-api](https://github.com/Kashif-Rezwi/better-dev-api))

---

## 🚀 Getting Started

### 1. **Clone the repository**
```bash
git clone https://github.com/Kashif-Rezwi/better-dev-ui.git
cd better-dev-ui
```

### 2. **Install dependencies**
```bash
npm install
```

### 3. **Configure environment**
```bash
# Create .env file
cp .env.example .env
```

Edit `.env`:
```env
# Vite Development Server Port
VITE_CLIENT_PORT=3000

# Backend API URL
VITE_API_BASE_URL=http://localhost:3001
# For production:
# VITE_API_BASE_URL=https://your-backend-api.com
```

### 4. **Start development server**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 5. **Build for production**
```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
better-dev-ui/
├── public/                      # Static assets
│   └── dev-logo-light.png      # App logo
│
├── src/
│   ├── components/              # React components
│   │   ├── actions-panel/       # Left sidebar components
│   │   │   ├── ActionsPanel.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── Recents.tsx
│   │   │   └── UserProfile.tsx
│   │   │
│   │   ├── activities-panel/    # Right sidebar components
│   │   │   ├── ActivitiesPanel.tsx
│   │   │   ├── SystemPromptCard.tsx
│   │   │   └── SystemPromptModal.tsx
│   │   │
│   │   ├── chat-area/           # Main chat components
│   │   │   ├── ChatArea.tsx
│   │   │   ├── Composer.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageActions.tsx
│   │   │   ├── ToolCallStatus.tsx
│   │   │   ├── SourceCard.tsx
│   │   │   ├── SearchSummary.tsx
│   │   │   ├── ScrollToBottom.tsx
│   │   │   ├── Greeting.tsx
│   │   │   └── ChatSkeleton.tsx
│   │   │
│   │   ├── common/              # Shared components
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── Toaster.tsx
│   │   │
│   │   └── ui/                  # UI primitives (Radix)
│   │       ├── avatar.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── separator.tsx
│   │       └── textarea.tsx
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── conversations/       # Conversation hooks
│   │   │   ├── index.ts
│   │   │   ├── keys.ts
│   │   │   ├── useConversations.ts
│   │   │   ├── useConversation.ts
│   │   │   ├── useCreateConversationWithMessage.ts
│   │   │   ├── useUpdateConversation.ts
│   │   │   ├── useDeleteConversation.ts
│   │   │   ├── useGenerateTitle.ts
│   │   │   └── useUpdateSystemPrompt.ts
│   │   │
│   │   ├── useAuth.ts
│   │   ├── useConversationMessages.ts
│   │   └── useScrollToMessage.ts
│   │
│   ├── lib/                     # Core libraries
│   │   ├── api.ts              # Axios instance & interceptors
│   │   ├── auth.ts             # Auth API methods
│   │   ├── conversations.ts    # Conversations API methods
│   │   ├── createChatTransport.ts  # AI SDK transport
│   │   ├── queryClient.ts      # TanStack Query config
│   │   └── utils.ts            # Utility functions
│   │
│   ├── pages/                   # Page components
│   │   ├── ChatPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   │
│   ├── types/                   # TypeScript types
│   │   └── index.ts
│   │
│   ├── utils/                   # Utility functions
│   │   ├── index.ts
│   │   ├── toast.ts
│   │   ├── conversationHelpers.ts
│   │   └── optimisticUpdates.ts
│   │
│   ├── constants/               # App constants
│   │   └── index.ts
│   │
│   ├── App.tsx                  # Root component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
│
├── .env.example                 # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── vercel.json                  # Vercel deployment config
└── README.md
```

---

## 🏗️ Architecture

### **Component Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                           App                               │
│                      (BrowserRouter)                        │
└────────────────────────────┬────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  ProtectedRoute │
                    │  (Auth Wrapper) │
                    └────────┬────────┘
                             │
                ┌────────────▼────────────┐
                │        ChatPage         │
                │    (Layout Manager)     │
                └─┬──────────┬──────────┬─┘
                  │          │          │
      ┌───────────▼───┐ ┌────▼───┐ ┌────▼──────────┐
      │ ActionsPanel  │ │  Chat  │ │ Activities    │
      │  (Left)       │ │  Area  │ │ Panel (Right) │
      └───────────────┘ └────────┘ └───────────────┘
```

### **State Management Flow**

```
User Action
    ↓
React Hook (useAuth, useConversations, etc.)
    ↓
TanStack Query Mutation/Query
    ↓
API Call (Axios)
    ↓
Backend Response
    ↓
Optimistic Update (if applicable)
    ↓
Cache Update (TanStack Query)
    ↓
UI Re-render
```

### **Data Flow**

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interaction                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                ┌────────▼────────┐
                │  React Hooks    │
                │  (useAuth, etc) │
                └────────┬────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
┌───────▼──────────┐         ┌────────────▼───────┐
│  TanStack Query  │         │   Local State      │
│  (Server State)  │         │   (UI State)       │
└───────┬──────────┘         └────────────────────┘
        │
┌───────▼──────────┐
│   API Layer      │
│   (Axios)        │
└───────┬──────────┘
        │
┌───────▼──────────┐
│   Backend API    │
│   (NestJS)       │
└──────────────────┘
```

### **Streaming Architecture**

```
User sends message
    ↓
AI SDK v5 Transport
    ↓
Server-Sent Events (SSE) Connection
    ↓
Backend streams chunks
    ↓
Frontend receives events:
    - text-delta (text chunks)
    - tool-call-start (tool begins)
    - tool-result (tool completes)
    - finish (stream ends)
    ↓
UI updates in real-time
    ↓
Message saved to backend
```

---

## 💻 Development

### **Available Scripts**

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run preview          # Preview production build locally

# Build
npm run build            # Build for production

# Linting
npm run lint             # Run ESLint
```

### **Code Style**

This project uses:
- **ESLint** for code quality
- **TypeScript** for type safety
- **Prettier** (via ESLint) for formatting

### **Component Guidelines**

1. **Functional Components** - Use function components with hooks
2. **TypeScript** - Always type props and state
3. **Custom Hooks** - Extract logic into reusable hooks
4. **Error Handling** - Use error boundaries for component errors
5. **Loading States** - Show skeletons during data fetching
6. **Optimistic Updates** - Update UI before server confirmation

### **State Management Best Practices**

```typescript
// ✅ Good - Using TanStack Query for server state
const { data: conversations, isLoading } = useConversations();

// ❌ Bad - Using useState for server state
const [conversations, setConversations] = useState([]);
useEffect(() => {
  fetchConversations().then(setConversations);
}, []);

// ✅ Good - Optimistic updates
const { mutate: deleteConversation } = useDeleteConversation();

// ❌ Bad - Manual state updates
const deleteConversation = async (id) => {
  setConversations(prev => prev.filter(c => c.id !== id));
  await api.delete(`/conversations/${id}`);
};
```

### **Folder Organization**

- **`/components`** - Presentational components
- **`/hooks`** - Custom React hooks (data fetching, logic)
- **`/lib`** - Core libraries (API, auth, utils)
- **`/pages`** - Page-level components
- **`/types`** - TypeScript type definitions
- **`/utils`** - Pure utility functions
- **`/constants`** - App-wide constants

---

## 🚢 Build & Deployment

### **Build for Production**

```bash
npm run build
```

This creates an optimized production build in `dist/`:
- Minified JavaScript
- Optimized assets
- Source maps for debugging

### **Deploy to Vercel** (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Vercel auto-detects Vite configuration

3. **Set Environment Variables**
   ```
   VITE_API_BASE_URL=https://your-backend-api.com
   ```

4. **Deploy**
   - Vercel automatically deploys on every push
   - Preview deployments for pull requests

### **Deploy to Netlify**

```bash
# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### **Deploy to Custom Server**

```bash
# Build
npm run build

# Upload dist/ to your server
scp -r dist/* user@server:/var/www/html/
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# ============================================
# VITE DEVELOPMENT SERVER
# ============================================
VITE_CLIENT_PORT=3000

# ============================================
# BACKEND API CONFIGURATION
# ============================================
# Local development
VITE_API_BASE_URL=http://localhost:3001

# Production (Render.com example)
# VITE_API_BASE_URL=https://nebula-api-unq7.onrender.com

# Production (Your custom domain)
# VITE_API_BASE_URL=https://api.your-domain.com
```

### **Environment Variable Naming**

⚠️ **Important:** All environment variables must be prefixed with `VITE_` to be accessible in the frontend.

```typescript
// ✅ Correct - Will work
const apiUrl = import.meta.env.VITE_API_BASE_URL;

// ❌ Incorrect - Will be undefined
const apiUrl = import.meta.env.API_BASE_URL;
```

---

## 🎯 Key Features Deep Dive

### **1. Real-time Streaming**

The app uses **AI SDK v5** for streaming AI responses:

```typescript
// src/hooks/useConversationMessages.ts
const { messages, status, sendMessage } = useChat({
  transport: createChatTransport(conversationId ?? 'default'),
});

// Streaming states: 'ready', 'streaming', 'error'
```

**How it works:**
1. User sends message
2. Backend starts streaming via Server-Sent Events (SSE)
3. Frontend receives text chunks in real-time
4. UI updates instantly as chunks arrive
5. Stream completes, message saved

### **2. Optimistic Updates**

Instant UI feedback before server confirmation:

```typescript
// src/hooks/conversations/useDeleteConversation.ts
onMutate: async (deletedId) => {
  // Snapshot current state
  const previous = queryClient.getQueryData(conversationKeys.lists());
  
  // Update UI immediately
  queryClient.setQueryData(
    conversationKeys.lists(),
    (old) => old.filter(conv => conv.id !== deletedId)
  );
  
  return { previous };
},

onError: (_, __, context) => {
  // Rollback on error
  queryClient.setQueryData(conversationKeys.lists(), context.previous);
},
```

### **3. Tool Call Visibility**

Watch AI use tools like web search in real-time:

```typescript
// Messages include tool call parts
{
  id: 'msg-123',
  role: 'assistant',
  parts: [
    { type: 'text', text: 'Let me search for that...' },
    { 
      type: 'tool-tavily_web_search',
      state: 'output-available',
      output: { results: [...] }
    },
    { type: 'text', text: 'Based on my research...' }
  ]
}
```

**UI Features:**
- Shows tool execution in progress
- Displays search results with sources
- Expandable source cards
- Citation tracking

### **4. Smart Caching**

TanStack Query manages all server state:

```typescript
// src/lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // Fresh for 5 min
      gcTime: 1000 * 60 * 10,     // Cache for 10 min
      refetchOnWindowFocus: false, // Better UX
    },
  },
});
```

**Benefits:**
- Automatic caching
- Background refetching
- Optimistic updates
- Request deduplication
- Automatic retries

### **5. Auto-Scroll Behavior**

Smart scrolling that doesn't interrupt reading:

```typescript
// src/hooks/useConversationMessages.ts
useEffect(() => {
  // Only auto-scroll for USER messages
  if (messages.length > 0) {
    const latestMessage = messages[messages.length - 1];
    
    if (latestMessage.role === 'user') {
      scrollToMessage(latestMessage.id, { behavior: 'smooth' });
    }
  }
}, [messages.length]);
```

**Features:**
- Auto-scroll on new user messages
- Manual scroll button when scrolled up
- Scroll indicator during streaming
- Smooth animations

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### **Reporting Bugs**

1. Check if bug already exists in [Issues](https://github.com/Kashif-Rezwi/better-dev-ui/issues)
2. Create new issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser/OS information

### **Feature Requests**

1. Open a new issue with `[Feature Request]` prefix
2. Describe the feature and use case
3. Explain why it would be valuable

### **Pull Requests**

1. Fork the repository
2. Create a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Make your changes
4. Write/update tests if applicable
5. Commit with clear messages
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
6. Push to your fork
   ```bash
   git push origin feature/amazing-feature
   ```
7. Open a Pull Request

### **Development Guidelines**

- Follow existing code style
- Use TypeScript for all new code
- Write meaningful commit messages
- Update documentation if needed
- Test your changes locally
- Keep PRs focused and small

### **Commit Message Format**

```
feat: add user profile dropdown
fix: resolve streaming connection issue
docs: update README with new features
style: format code with prettier
refactor: extract message list logic to hook
test: add tests for auth flow
chore: update dependencies
```

---

## 📄 License

This project is licensed under the **UNLICENSED** License.

---

## 🙏 Acknowledgments

- [React](https://react.dev/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [TanStack Query](https://tanstack.com/query) - Data fetching
- [AI SDK](https://sdk.vercel.ai/) - AI streaming
- [Radix UI](https://www.radix-ui.com/) - UI primitives
- [shadcn/ui](https://ui.shadcn.com/) - Component patterns and styling
- [Vercel](https://vercel.com/) - Deployment platform

---

## 📞 Support

For questions or issues:
- Open an [Issue](https://github.com/Kashif-Rezwi/better-dev-api/issues)
- Contact: [GitHub Profile](https://github.com/Kashif-Rezwi)

---

## 🗺️ Roadmap

- [ ] **Image Upload** - Attach images to conversations
- [ ] **Export Conversations** - Download as markdown/PDF

---

**Built with ❤️ using ReactJS and TypeScript**