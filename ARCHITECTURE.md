# Architecture & Engineering Standards — `better-dev-ui`

This document defines the architectural principles, directory layout, and engineering standards for the `better-dev-ui` repository. It serves as the source of truth for both developers and AI coding agents working on this codebase.

---

## 1. Core Principles

1. **Unidirectional Dependency Flow**:
   - `Pages` → `Components (Feature / Layout)` → `Hooks (Domain / UI)` → `Services (API) / Utils / Types` → `UI Primitives`.
   - UI components should never make direct `axios`/fetch calls or manipulate global storage directly.
2. **Strict Separation of Concerns**:
   - **Services (`src/services/`)**: Pure TypeScript modules for network communication and data transformations. No React hooks or UI logic.
   - **Domain Hooks (`src/hooks/`)**: React Query and stateful hooks that manage caching, optimistic updates, and lifecycle side effects.
   - **Presentation (`src/components/`)**: Composable, focused UI components adhering to the design system.
   - **Utilities (`src/utils/`)**: Deterministic, pure helper functions (formatting, storage, class merging).
3. **Zero `any` Policy**:
   - Every message part, tool call, API request, and state model must be strictly typed using discriminated unions.
4. **Predictable State & Cache Ownership**:
   - Server state is exclusively managed via TanStack Query (`@tanstack/react-query`) with query key factories in `src/hooks/conversations/keys.ts` and `src/hooks/useAuth.ts`.
   - UI / Local state (drawers, panels, drafting) is managed via dedicated custom hooks (`usePanelState`, `useChatAttachments`).
   - Persistent preferences (modes, collapse state) use `safeStorage` in `src/utils/storage.ts`.

---

## 2. Directory Structure

```
src/
├── components/
│   ├── actions-panel/      # Left sidebar navigation, recents list, user profile
│   ├── activities-panel/   # Right sidebar project instructions & editor
│   ├── chat-area/          # Chat conversation view, composer, message list, tool outputs
│   ├── common/             # Cross-cutting components (ErrorBoundary, Toaster, Markdown, ConfirmDialog, Skeleton)
│   └── ui/                 # Headless Radix UI styled primitives (Button, Dialog, DropdownMenu, Avatar, Card, Separator, Textarea)
├── constants/              # Centralized route paths, storage keys, validation rules, API configuration
├── hooks/
│   ├── chat/               # Chat-specific hooks (useChatAttachments)
│   ├── conversations/      # React Query hooks for conversation CRUD & cache operations
│   ├── ui/                 # UI state hooks (usePanelState)
│   ├── useAuth.ts          # Authentication hooks (useUser, useProfile, useLogin, useRegister, useLogout)
│   ├── useConversationMessages.ts # AI SDK v5 streaming & message integration
│   ├── useModePreference.ts # Operational mode persistence
│   └── useScrollToMessage.ts # Auto-scrolling utility
├── pages/                  # Route-level page views (ChatPage, LoginPage, RegisterPage)
├── services/               # Pure API & network clients
│   ├── api.ts              # Axios instance & interceptors
│   ├── auth.service.ts     # Auth API endpoints
│   ├── conversation.service.ts # Conversation CRUD, title generation, system prompt
│   ├── upload.service.ts   # File validation, uploads, progress tracking
│   ├── chat-transport.service.ts # AI SDK SSE DefaultChatTransport
│   └── query-client.ts     # TanStack Query client configuration
├── types/                  # Domain type definitions (auth.ts, chat.ts, conversation.ts, index.ts)
├── utils/                  # Deterministic utility functions
│   ├── cn.ts               # clsx + twMerge class merger
│   ├── date.ts             # Date and relative time formatting
│   ├── message.ts          # Message transformations (toUIMessage, getMessageText)
│   ├── storage.ts          # Safe localStorage wrapper
│   ├── toast.ts            # Toast notifications wrapper
│   ├── conversationHelpers.ts # Optimistic conversation generators
│   └── optimisticUpdates.ts   # Query cache update helpers
├── App.tsx                 # Route configuration with code-splitting
├── main.tsx                # React DOM root
└── index.css               # Tailwind v4 theme & typography
```

---

## 3. Data-Fetching & Caching Standards

### 3.1 Query Key Factories
All TanStack Query keys are defined in centralized key factories:
- Conversation keys: `conversationKeys` in `src/hooks/conversations/keys.ts`
- Auth keys: `authKeys` in `src/hooks/useAuth.ts`

### 3.2 Optimistic Updates
When performing mutations that modify lists (e.g. creating/deleting conversations) or details (e.g. system prompts):
1. Cancel active outgoing queries using `queryClient.cancelQueries()`.
2. Snapshot previous cache data in `onMutate` for rollback.
3. Apply optimistic updates immediately using `queryClient.setQueryData()`.
4. In `onError`, rollback to the previous snapshot and notify the user via `toast.error()`.
5. In `onSettled`, invalidate queries using `queryClient.invalidateQueries()`.

---

## 4. Guidelines for Adding Features

1. **Adding a New API Endpoint**:
   - Define payload/response types in `src/types/`.
   - Add the pure API call to the appropriate file in `src/services/`.
   - Create or update the corresponding React Query hook in `src/hooks/`.
2. **Adding a New Component**:
   - Place feature-specific components in their respective feature directory (e.g., `src/components/chat-area/`).
   - Use `cn` from `src/utils/cn` for class merging.
   - Use design system tokens (`bg-surface`, `bg-surface-hover`, `text-foreground`, `border-border`, `bg-primary`).
3. **Modifying Chat Message Formats**:
   - Update `MessagePart` discriminated union in `src/types/chat.ts`.
   - Update `toUIMessage` transformation in `src/utils/message.ts`.
   - Add rendering logic to `src/components/chat-area/MessageContent.tsx`.
