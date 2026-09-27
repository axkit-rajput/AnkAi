# 🤖 AnkAI — Multi-Agent AI Orchestration Platform

![LangGraph](https://img.shields.io/badge/LangGraph-1.4.7-blue?logo=langchain&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-1.2.2-green?logo=langchain&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?logo=node.js&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-GPT--OSS_120B-orange?logo=groq&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?logo=googlegemini&logoColor=white)
![DeepSeek](https://img.shields.io/badge/DeepSeek-V3-8B5CF6)
![Qdrant](https://img.shields.io/badge/Qdrant-RAG-DC382D)
![MongoDB](https://img.shields.io/badge/MongoDB-9.7-47A248?logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Memory-DC382D?logo=redis&logoColor=white)
![AWS ECS](https://img.shields.io/badge/Deployed_on-AWS_ECS-FF9900?logo=amazonecs&logoColor=white)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-yellowgreen)

A full-stack, production-grade AI platform that orchestrates **8 specialized agents** through a **LangGraph state graph**, enabling intelligent task routing across multiple LLM providers with built-in RAG, document generation, and credit-based billing.

🔗 **[Live Demo](https://ank-ai-gray.vercel.app)** · 📂 **[GitHub](https://github.com/axkit-rajput/AnkAi)**

---

## ✨ Features

- 🧠 **8 Specialized AI Agents** — Chat, Search, Coder, PDF, PPT, Vision, RAG, Image Analyzer
- 🔀 **Intelligent Routing** — LLM-based intent classification with file-type overrides
- 🔗 **Multi-Agent Chaining** — Search → Chat synthesis pipeline
- 📄 **RAG Pipeline** — PDF Q&A with Qdrant vector search and anti-hallucination guardrails
- 🎨 **Document Generation** — AI-generated PDFs (PDFKit) and slide decks (PptxGenJS)
- 🖼️ **Vision & Image** — Multimodal image analysis (Gemini) and AI image generation (Pollinations)
- 💻 **Live Code Preview** — Monaco editor with sandboxed HTML/CSS/JS preview
- 🎤 **Voice Input** — Web Speech API dictation
- 💳 **Credit System** — Razorpay billing with atomic credit reservation
- ⚡ **Streaming** — Real-time SSE response streaming

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React 19 + Vite 8                       │
│         Redux Toolkit  ·  Monaco Editor  ·  SSE             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │ API Gateway │  Express 5 · CORS · Auth
                    └──┬───┬───┬──┘
           ┌───────────┤   │   ├───────────┐
           ▼           ▼   │   ▼           ▼
      ┌────────┐  ┌────────┤  ┌────────┐  ┌─────────┐
      │  Auth  │  │  Chat  │  │ Agent  │  │ Billing │
      │Service │  │Service │  │Service │  │ Service │
      └───┬────┘  └───┬────┘  └───┬────┘  └────┬────┘
          │           │           │             │
     Firebase    MongoDB     LangGraph      Razorpay
      + Redis                  + LLMs
                              + Qdrant
                              + AWS S3
```

### Microservices

| Service | Port | Responsibility |
|---------|------|----------------|
| **Gateway** | env | Reverse proxy, session auth, header injection, rate limiting |
| **Auth** | env | Firebase auth, Redis sessions, user management, credit operations |
| **Chat** | env | Conversation CRUD, message persistence (MongoDB) |
| **Agent** | env | LangGraph orchestration, LLM calls, RAG, document generation |
| **Billing** | env | Razorpay orders, webhook verification, plan upgrades |

---

## 🧠 Agent System

### LangGraph State Graph

The core of AnkAI is a **LangGraph StateGraph** that routes user queries to the right agent:

```
                    ┌──────────┐
        ┌──────────►│   Chat   ├──────────────┐
        │           └──────────┘              │
        │           ┌──────────┐              │
        │    ┌─────►│  Search  ├───► Chat ────┤
        │    │      └──────────┘              │
        │    │      ┌──────────┐              │
        │    │  ┌──►│  Coder   ├──────────────┤
        │    │  │   └──────────┘              │
┌───────┴┐   │  │   ┌──────────┐              │
│ Router ├───┼──┼──►│   PDF    ├──────────────┤
└───▲────┘   │  │   └──────────┘              ▼
    │        │  │   ┌──────────┐         ┌────────┐
 __start__   │  ├──►│   PPT    ├────────►│ __end__│
             │  │   └──────────┘         └────────┘
             │  │   ┌──────────┐              ▲
             │  ├──►│  Vision  ├──────────────┤
             │  │   └──────────┘              │
             │  │   ┌──────────┐              │
             │  ├──►│ PDF RAG  ├──────────────┤
             │  │   └──────────┘              │
             │  │   ┌──────────┐              │
             │  └──►│ Img Anlz ├──────────────┘
             │      └──────────┘
             │
        Routing Logic:
        1. File-type override (PDF → RAG, Image → Analyzer)
        2. Explicit user selection
        3. LLM intent classification (auto mode)
```

### Agent Details

| Agent | Model | Credits | What It Does |
|-------|-------|---------|-------------|
| **Chat** | Groq (GPT-OSS 120B) | 1 | General conversation with 20-message context window |
| **Search** | Tavily → Groq | 5 | Web search (5 results + images) → Chat synthesis |
| **Coder** | DeepSeek-V3 (OpenRouter) | 10 | Two-phase: intent classification → multi-file code generation with JSON output |
| **PDF** | Groq | 10 | Generates styled A4 PDFs via PDFKit, uploads to S3 |
| **PPT** | Groq | 10 | Generates 16:9 branded slide decks via PptxGenJS, uploads to S3 |
| **Vision** | Pollinations AI | 10 | Prompt engineering → AI image generation → S3 |
| **PDF RAG** | Gemini Embeddings + Groq | 10 | Full RAG pipeline with anti-hallucination guardrails |
| **Image Analyzer** | Gemini 2.5 Flash | 10 | Multimodal analysis: OCR, diagram interpretation, structured explanations |

### Multi-Model Routing Strategy

```
Task                    Model                   Why
─────────────────────────────────────────────────────────
Chat / Synthesis        Groq (GPT-OSS 120B)     Fast inference, general reasoning
Code Generation         DeepSeek-V3             Best code quality at temp=0
Vision / Multimodal     Gemini 2.5 Flash        Native multimodal support
Embeddings              Gemini Embedding-001    High-quality vector representations
Intent Classification   Groq (GPT-OSS 120B)     Single-token fast classification
Image Generation        Pollinations AI         Free, high-quality image synthesis
```

---

## 📄 RAG Pipeline

```
User Upload (PDF, ≤20MB)
        │
        ▼
   pdf-parse (text extraction + scan detection)
        │
        ▼
   RecursiveCharacterTextSplitter
   (chunkSize: 1000, chunkOverlap: 200)
        │
        ▼
   GoogleGenerativeAIEmbeddings (gemini-embedding-001)
        │
        ▼
   Qdrant Vector Store
   (ephemeral collection: pdf-${timestamp})
        │
        ▼
   Similarity Search (top-k = 5)
        │
        ▼
   Grounded LLM Response
   (strict anti-hallucination system prompt)
        │
        ▼
   Temp file cleanup (finally block)
```

**Key design decisions:**
- **Ephemeral collections** per document eliminate cross-document contamination
- **Scan detection** rejects image-only PDFs with a helpful error message
- **Anti-hallucination prompts** force the model to only answer from the uploaded content
- **Automatic cleanup** ensures temp files are always removed, even on errors

---

## 🖥️ Frontend

Built with **React 19**, **Vite 8**, and **Tailwind CSS 4**.

### Key Features

- **Monaco Code Editor** — VS Code-like editor with syntax highlighting for generated code
- **Live Preview Sandbox** — Inline iframe renders HTML/CSS/JS projects in real-time
- **Streaming Responses** — SSE-powered token-by-token response rendering
- **Rich Markdown** — Syntax highlighting, image lightbox, scrollable tables
- **Voice Dictation** — Web Speech API for hands-free input
- **Billing Drawer** — Credit progress bar, plan cards, Razorpay checkout integration
- **Responsive Design** — Collapsible sidebar, mobile-friendly drawer navigation
- **Framer Motion** — Smooth transitions and animations throughout

### State Management

```
Redux Store
├── userSlice          → User data, auth state
├── conversationSlice  → Conversations list, active selection
└── messageSlice       → Messages, artifacts, loading state, agent selection
```

---

## 💳 Billing & Credits

| Plan | Price | Credits | Duration |
|------|-------|---------|----------|
| Free | ₹0 | 100 | 30 days |
| Starter | ₹199 | 500 | 30 days |
| Pro | ₹499 | 1,000 | 30 days |

- **Atomic pre-execution reservation** — Credits are deducted *before* the LLM call via MongoDB's `$gte` + `$inc` conditional update, preventing race conditions
- **Per-agent rate limiting** — Redis sliding counters (20/min for chat, 5/min for others)
- **Razorpay webhook verification** — HMAC-SHA256 with `crypto.timingSafeEqual`
- **Idempotent payment processing** — Prevents double-claiming via status-based conditional updates

---

## 🔒 Security

- **Session-based auth** — Firebase ID tokens verified server-side, converted to Redis sessions with 7-day TTL
- **httpOnly secure cookies** — `sameSite: "none"`, no client-side token exposure
- **Header spoofing prevention** — Gateway strips any client-supplied `x-user-id` before injecting the authenticated value
- **File validation** — Multer enforces 20MB limit, MIME type whitelist, randomized filenames
- **Presigned URLs** — S3 downloads expire after 24 hours

---

## 🛠️ Tech Stack

### AI & ML
| Technology | Usage |
|-----------|-------|
| LangGraph | Multi-agent state graph orchestration |
| LangChain | LLM integrations, embeddings, text splitters, tools |
| Qdrant | Vector database for RAG |
| Groq | Fast LLM inference (GPT-OSS 120B) |
| Google Gemini | Multimodal vision + embeddings |
| DeepSeek-V3 | Code generation via OpenRouter |
| Tavily | Web search API |
| Pollinations AI | Image generation |

### Backend
| Technology | Usage |
|-----------|-------|
| Node.js + Express 5 | Microservices framework |
| MongoDB + Mongoose | Persistent data storage |
| Redis (ioredis) | Sessions, conversation memory, rate limiting |
| AWS S3 (SDK v3) | File storage with presigned URLs |
| Firebase Admin | Authentication token verification |
| Razorpay | Payment processing |
| PDFKit | Server-side PDF generation |
| PptxGenJS | Server-side PowerPoint generation |

### Frontend
| Technology | Usage |
|-----------|-------|
| React 19 | UI framework |
| Vite 8 | Build tool |
| Tailwind CSS 4 | Styling |
| Redux Toolkit | State management |
| Monaco Editor | Code editing |
| Framer Motion | Animations |
| React Markdown | Response rendering |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Docker** (for Redis)
- **MongoDB** instance (local or Atlas)
- **Qdrant** instance (local or cloud)

### API Keys Needed

| Service | Required For |
|---------|-------------|
| Firebase | Authentication |
| Groq | Chat, Search, PDF, PPT agents |
| Google AI (Gemini) | Vision, Embeddings |
| OpenRouter | Coder agent (DeepSeek) |
| Tavily | Web search |
| AWS S3 | File storage |
| Razorpay | Billing |
| Qdrant | Vector database |

### Installation

```bash
# Clone the repository
git clone https://github.com/axkit-rajput/AnkAi.git
cd AnkAi

# Install root dependencies
npm install

# Install all service dependencies
npm --prefix backend/gateway install
npm --prefix backend/services/auth install
npm --prefix backend/services/chat install
npm --prefix backend/services/agent install
npm --prefix backend/services/billing install
npm --prefix front install
```

### Environment Setup

Create `.env` files in each service directory with the required variables. Refer to each service's configuration files for the expected environment variables.

### Running Locally

```bash
# Start Redis (Docker)
npm run redis

# Start all services + frontend concurrently
npm run dev

# Or run backend and frontend separately
npm run dev:backend
npm run dev:front
```

### Stop Redis

```bash
npm run redis:stop
```

---

## 📁 Project Structure

```
AnkAi/
├── backend/
│   ├── docker-compose.yml              # Redis container
│   ├── shared/
│   │   └── redis/redis.js              # Shared ioredis client
│   ├── gateway/
│   │   ├── index.js                    # Express proxy server
│   │   ├── middleware/auth.middleware.js
│   │   └── utils/proxyWithHeader.js    # Spoof-proof header injection
│   └── services/
│       ├── auth/                       # Firebase auth + credit management
│       ├── chat/                       # Conversation & message CRUD
│       ├── agent/
│       │   ├── agents/                 # 8 specialized agent implementations
│       │   │   ├── chat.agent.js
│       │   │   ├── search.agent.js
│       │   │   ├── coding.agent.js
│       │   │   ├── pdf.agent.js
│       │   │   ├── ppt.agent.js
│       │   │   ├── vision.agent.js
│       │   │   ├── pdfRag.agent.js
│       │   │   └── imageAnalyzer.agent.js
│       │   ├── graph/                  # LangGraph state machine
│       │   │   ├── graph.js            # StateGraph definition
│       │   │   ├── router.js           # Intent classification + routing
│       │   │   └── state.js            # Annotation schema
│       │   ├── config/                 # LLMs, embeddings, memory, S3, etc.
│       │   └── utils/                  # PDF/PPT generation, JSON parsing
│       └── billing/                    # Razorpay integration
└── front/
    └── src/
        ├── components/                 # UI components
        │   ├── Artifact.jsx            # Monaco editor + live preview
        │   ├── ChatInput.jsx           # Input with voice dictation
        │   ├── MessageBubble.jsx       # Rich markdown rendering
        │   └── BillingDrawer.jsx       # Credit management UI
        ├── features/                   # API call functions
        ├── pages/                      # Landing, Login, Dashboard
        └── redux/                      # Store, slices
```

---

## 🚢 Deployment

### Architecture Overview

```
┌──────────────┐       push to main        ┌──────────────────────┐
│   Developer  │  ─────────────────────►    │   GitHub Actions     │
└──────────────┘                            │   (CI/CD Pipeline)   │
                                            └──────────┬───────────┘
                                                       │
                              ┌─────────────────────────┼─────────────────────────┐
                              │                         │                         │
                              ▼                         ▼                         ▼
                     ┌─────────────────┐     ┌────────────────────┐    ┌──────────────────┐
                     │  Docker Build   │     │   Push to AWS ECR  │    │  Deploy to ECS   │
                     │  (5 services)   │────►│   (5 images)       │───►│  (force restart)  │
                     └─────────────────┘     └────────────────────┘    └──────────────────┘

┌──────────────┐       git push             ┌──────────────────────┐
│   Frontend   │  ─────────────────────►    │   Vercel (auto)      │
│   (front/)   │                            │   vite build + CDN   │
└──────────────┘                            └──────────────────────┘
```

### Backend — AWS ECS (Dockerized)

Each microservice has its own `Dockerfile` and runs as a separate container on **AWS ECS**:

| Service | Docker Image | Port | ECR Repository |
|---------|-------------|------|----------------|
| Gateway | `gateway:latest` | 8000 | `gateway` |
| Auth | `auth-service:latest` | 8001 | `auth-service` |
| Chat | `chat-service:latest` | 8002 | `chat-service` |
| Agent | `agent-service:latest` | 8003 | `agent-service` |
| Billing | `billing-service:latest` | 8004 | `billing-service` |

**CI/CD Pipeline** (`.github/workflows/deploy.yml`):

1. **Trigger** — Push to `main` branch
2. **Build** — Docker builds each service from `backend/` context using service-specific Dockerfiles
3. **Push** — Tags and pushes all 5 images to **AWS ECR**
4. **Deploy** — Runs `aws ecs update-service --force-new-deployment` for each service on the ECS cluster

```bash
# Manual Docker build (example for gateway)
docker build -f backend/gateway/Dockerfile -t gateway backend

# Manual Docker build (example for agent service)
docker build -f backend/services/agent/Dockerfile -t agent-service backend
```

### Frontend — Vercel

The React frontend deploys automatically to **Vercel** with:
- **Build command**: `vite build`
- **SPA routing**: All routes rewrite to `/index.html` via `vercel.json`
- **Live URL**: [ank-ai-gray.vercel.app](https://ank-ai-gray.vercel.app)

### Infrastructure Services

| Service | Hosting | Purpose |
|---------|---------|---------|
| **MongoDB** | MongoDB Atlas | Persistent data (users, conversations, messages, payments) |
| **Redis** | AWS ElastiCache / Docker | Sessions, conversation memory, rate limiting |
| **Qdrant** | Qdrant Cloud | Vector database for RAG |
| **AWS S3** | AWS | Generated file storage (PDFs, PPTs, images) |

### GitHub Actions Secrets Required

```
AWS_ACCESS_KEY          # IAM access key
AWS_SECRET_ACCESS_KEY   # IAM secret key
AWS_REGION              # e.g. ap-south-1
AWS_ACCOUNT_ID          # 12-digit AWS account ID
ECS_CLUSTER             # ECS cluster name
GATEWAY_SERVICE         # ECS service name for gateway
AUTH_SERVICE             # ECS service name for auth
CHAT_SERVICE             # ECS service name for chat
AGENT_SERVICE            # ECS service name for agent
BILLING_SERVICE          # ECS service name for billing
```

---

## 📄 License

ISC

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/axkit-rajput">Ankit Rajput</a>
</p>
