<div align="center">

# ⚡ TaskHub

**Enterprise Collaborative Task & Workspace Management Platform**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel%20%2B%20Render-success?style=for-the-badge&logo=vercel)](https://taskhub-projects.vercel.app)
[![Node.js](https://img.shields.io/badge/Node.js-22%20LTS-green?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](<https://img.shields.io/badge/PostgreSQL-17%20(Neon)-336791?style=for-the-badge&logo=postgresql>)](https://neon.tech)
[![Docker](https://img.shields.io/badge/Docker-Multi--stage-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[**Explore Live Application ➔**](https://taskhub-projects.vercel.app) · [Report Bug](https://github.com/imdeepakrathod/taskhub/issues) · [Request Feature](https://github.com/imdeepakrathod/taskhub/issues)

</div>

---

## 📌 Overview

**TaskHub** is a production-ready, full-stack collaborative project management platform designed for modern engineering and product teams. Engineered from scratch with **multi-tenant workspace isolation**, **sub-millisecond database queries**, and **zero-latency real-time collaboration**, TaskHub delivers a seamless Linear/Jira-tier user experience.

### 🌐 Live Production Deployment

- **Frontend Application:** [https://taskhub-projects.vercel.app](https://taskhub-projects.vercel.app) (Hosted on Vercel Global Edge CDN)
- **Backend API & WebSockets:** [https://taskhub-backend-08gc.onrender.com](https://taskhub-backend-08gc.onrender.com) (Node.js on Render)
- **Database Cluster:** Serverless PostgreSQL 17 on [Neon.tech](https://neon.tech) with pooled connections.

---

## 🚀 Key Features & Architectural Highlights

### ⚡ Real-Time Collaboration & WebSockets

- **Socket.IO Event Engine:** Multi-user instant state synchronization across projects without polling.
- **Optimistic UI Updates:** 0ms perceived latency on Kanban drag-and-drop actions with TanStack React Query rollback on error.
- **Live Status Pill:** Real-time connection badge (`🟢 Live`) reflecting live socket heartbeat state.

### 🔔 In-App Real-Time Notification Center

- **Private User Socket Rooms:** Direct targeted event delivery (`user:${userId}`) for task assignments and comment activity.
- **Navbar Bell Hub:** Animated unread badge counter, tabbed filter popover (`All` / `Unread`), relative timestamps, and one-click "Mark all as read".

### 📊 Kanban Board & Workflow Execution

- **HTML5 Drag-and-Drop:** Intuitive cross-column task reordering with backend position recalculation.
- **Task Due Dates & Overdue Badges:** Dynamic calendar day calculations with color-coded status badges (`Overdue`, `Due Today`, `Due Soon`).
- **Multi-Criteria Filter Toolbar:** Filter board by Priority, Assignee, Labels, and Due Date ranges simultaneously.

### 🛡️ Multi-Tenant Workspaces & Granular RBAC

- **Role Hierarchy:** Enterprise permission engine with `OWNER`, `ADMIN`, and `MEMBER` roles.
- **Workspace Isolation:** Strict tenant boundaries enforced at both SQL query level and API middleware layer.
- **Danger Zone Operations:** GitHub-style defensive typing confirmation for destructive project and workspace deletions.

### 📎 Task File Attachments & Media Pipeline

- **Secure Upload Pipeline:** Multer disk storage with UUID randomized file hashing (preventing Path Traversal attacks).
- **Security Whitelist:** Strict MIME filtering blocking dangerous executables (`.exe`, `.sh`, `.html`) with a 10MB file limit.
- **Smart Previews:** In-panel thumbnail previews for images and stylized badges for documents, spreadsheets, and PDFs.

### 🔍 Global Workspace Command Palette (Ctrl+K)

- **Instant Entity Search:** Multi-entity query matching tasks and projects across the workspace with 300ms debouncing.
- **Global Shortcut Listener:** Accessible from anywhere in the app via `Ctrl+K` / `Cmd+K` or `ESC`.

### 💬 Rich Markdown & Workspace Mentions (@name)

- **Real-Time Member Auto-Complete:** Typing `@` displays an interactive member picker with keyboard navigation (`ArrowUp`/`ArrowDown`/`Enter`/`Esc`).
- **Safe Markdown Rendering:** Supports bold, italics, inline code snippets, and ordered/unordered lists.
- **Instant Mention Notifications:** Automatically pushes targeted real-time notifications to mentioned team members.

### 📊 Multi-View Switcher (Kanban Board, List, & Calendar Views)

- **▦ Kanban Board:** Visual drag-and-drop workflow with column limits and live position tracking.
- **☰ Tabular List View:** High-density triage table with inline status/priority editing and assignee selectors.
- **📅 Calendar Grid View:** Monthly date matrix mapping task deadlines to date cells with month navigation (`◀`, `▶`, `Today`).
- **Unified Filter State:** Search, priorities, assignees, and due dates remain synchronized across all views with zero redundant network requests.

### 🌗 Dark Mode Theme System

- **Custom Theme Engine:** Native Tailwind v4 custom dark variant (`@custom-variant dark`) toggling on `<html class="dark">`.
- **System Preference & LocalStorage Persistence:** Automatically respects OS color scheme on initial visit and persists user preference across sessions.
- **High-Contrast Dark Palette:** Polished midnight slate palette (`bg-gray-900`/`bg-gray-950`) designed for all dashboard views, modals, and team tables.

---

## 🏗️ System Architecture

```
                                ┌───────────────────────────────────────┐
                                │          CLIENT BROWSER BROWSER       │
                                │   React 19 + Vite + Tailwind CSS v4   │
                                └───────────────────┬───────────────────┘
                                                    │
                                     HTTPS REST API │ WebSockets (WSS)
                                                    ▼
                                ┌───────────────────────────────────────┐
                                │             API SERVER                │
                                │    Express 5 + TypeScript + Multer    │
                                ├───────────────────────────────────────┤
                                │  • JWT Auth & Cross-Site Cookies      │
                                │  • Tenant RBAC Authorization          │
                                │  • Socket.IO Realtime Engine          │
                                └───────────────────┬───────────────────┘
                                                    │
                                  Prisma ORM Client │ Pooled Connection
                                                    ▼
                                ┌───────────────────────────────────────┐
                                │       POSTGRESQL 17 (NEON.TECH)       │
                                ├───────────────────────────────────────┤
                                │  • B-Tree Composite & Desc Indexes    │
                                │  • Sub-millisecond Execution (<0.3ms) │
                                │  • Cascade Deletions & Audit Trail    │
                                └───────────────────────────────────────┘
```

---

## ⚡ Database Performance Tuning (`EXPLAIN ANALYZE`)

Every critical query path in TaskHub is verified and benchmarked using PostgreSQL's native `EXPLAIN ANALYZE` engine to eliminate sequential table scans:

| Query Operation             | Index Strategy                            | Query Execution Plan                           | Measured Execution Time |
| :-------------------------- | :---------------------------------------- | :--------------------------------------------- | :---------------------- |
| **Task Listing by Project** | `@@index([projectId, position])`          | `Index Scan` (Direct ordered retrieval)        | **0.262 ms**            |
| **Activity Feed Feed**      | `@@index([workspaceId, createdAt(Desc)])` | `Bitmap Index Scan` (Pre-sorted reverse index) | **0.076 ms (76 µs)**    |
| **Project-Scoped Search**   | `@@index([projectId, position])`          | `Index Cond` pre-filter + `Filter ILIKE`       | **0.295 ms**            |

---

## 🛠️ Tech Stack

| Domain                    | Technology                                                                    | Description                                                           |
| :------------------------ | :---------------------------------------------------------------------------- | :-------------------------------------------------------------------- |
| **Frontend Framework**    | [React 19](https://react.dev) + [Vite](https://vite.dev)                      | Modern component architecture with lightning HMR                      |
| **Styling**               | [Tailwind CSS v4](https://tailwindcss.com)                                    | Zero-runtime CSS engine with custom design system                     |
| **State & Data Fetching** | [TanStack Query v5](https://tanstack.com/query)                               | Client-side cache synchronization & optimistic updates                |
| **Backend Runtime**       | [Node.js 22 LTS](https://nodejs.org) + [Express 5](https://expressjs.com)     | High-throughput asynchronous REST & streaming server                  |
| **Database & ORM**        | [PostgreSQL 17](https://www.postgresql.org) + [Prisma](https://www.prisma.io) | Type-safe migrations, strict schemas, relations                       |
| **Realtime Engine**       | [Socket.IO 4.x](https://socket.io)                                            | Bidirectional event-driven WebSocket communication                    |
| **Authentication**        | JWT + Argon2                                                                  | Short-lived Access Tokens with HttpOnly SameSite=None refresh cookies |
| **DevOps & Containers**   | Docker + Docker Compose + Nginx                                               | Multi-stage production builds reducing images to <150MB               |
| **CI/CD**                 | GitHub Actions                                                                | Automated lint, format, typecheck, migrations, and container builds   |

---

## 💻 Local Development Setup

### Prerequisites

- **Node.js:** `v22.x` or higher
- **PostgreSQL:** `v16.x` or higher (or Docker)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/imdeepakrathod/taskhub.git
cd taskhub
```

### 2. Configure Environment Variables

**Backend (`backend/.env`):**

```env
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskhub?schema=public"
JWT_ACCESS_SECRET="your-32-character-random-access-secret"
JWT_REFRESH_SECRET="your-32-character-random-refresh-secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
```

**Frontend (`frontend/.env`):**

```env
VITE_API_URL="/api/v1"
VITE_SOCKET_URL=""
```

### 3. Install Dependencies & Setup Database

```bash
# Install backend dependencies
cd backend
npm install
npx prisma generate
npx prisma migrate dev

# Install frontend dependencies
cd ../frontend
npm install
```

### 4. Start Development Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🐳 Docker Deployment (Production Emulation)

To launch the complete application stack (PostgreSQL, Backend, and Nginx SPA Frontend) using Docker:

```bash
docker compose up --build
```

Access the application at `http://localhost:80`.

---

## 👨‍💻 Author

**Deepak Rathod**

- GitHub: [@imdeepakrathod](https://github.com/imdeepakrathod)
- Project: [TaskHub Repository](https://github.com/imdeepakrathod/taskhub)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
