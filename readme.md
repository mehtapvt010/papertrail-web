# PaperTrail AI – Zero-Cost, Privacy-First Document Vault

![Supabase](https://img.shields.io/badge/Supabase-Free%20Tier-3ECF8E)
![Qdrant](https://img.shields.io/badge/Qdrant-768%20dim%20vectors-ff69b4)


---

## Introduction

**PaperTrail AI** is a zero-cost, privacy-first web-based document vault that empowers users to securely store, search, and manage their important documents using in-browser encryption, AI-powered OCR, and vector search—all while running entirely on free-tier infrastructure. The system ensures maximum privacy by performing heavy computation directly in the browser, keeping sensitive data encrypted at rest and in transit.

---

## Table of Contents

- [Key Features](#key-features)
- [Roadmap](#roadmap)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

---

## Key Features

- 🔐 **Client-Side AES-GCM Encryption:** All files are encrypted in-browser before upload.
- 🧾 **Drag & Drop Upload Pipeline:** Seamless file capture and upload experience with image compression and PDF merge support.
- 🔎 **Tesseract.js OCR:** Fully client-side optical character recognition using WebAssembly.
- 🧠 **Heuristic Document Classification:** Detects document types (passport, license, receipt, etc.) and extracts metadata like expiry dates.
- 🤖 **AI-Powered Semantic Search:** Browser-side vector embeddings using bge-base-en with Qdrant vector search.
- 💬 **Chat RAG Interface:** Retrieval-augmented generation (RAG) chat interface with HuggingFace or optional OpenAI model fallback.
- 📆 **Expiry Radar Notifications:** Cloudflare Worker scans for expiring documents and sends web push notifications.
- 📊 **Admin Analytics Dashboard:** Upload metrics, usage KPIs, and self-hosted analytics via Plausible on Fly.io.
- 🌙 **Dark Mode & Responsive Design:** Fully mobile-friendly, dark mode toggle, skeleton loaders, and adaptive layouts.
- 🎯 **Zero-Cost Infrastructure:** Runs entirely on free-tier platforms: Vercel Hobby, Supabase Free, Qdrant Cloud, Cloudflare Workers, Upstash Redis.

---

## Roadmap

### Planned Features

- 📐 Deskew and perspective correction for skewed document images.
- ⚙️ SIMD-accelerated Tesseract builds for faster OCR.
- 📦 Full data export feature allowing ZIP archive download.
- 🔑 End-to-end encrypted key wrapping with user passwords.
- 📲 Companion mobile app (Expo) for camera-based capture.
- 🗣️ Natural language document summaries via LLM.
- 🚦 Full multi-region failover & high-availability backup jobs.
- 🧪 Continuous integration nightly regression testing matrix.
- 🌐 Expanded i18n localization for multi-language support.

---

## Getting Started

### Prerequisites

- [Node.js v20+](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- Supabase account (Free Tier)
- Vercel account (Hobby Plan)
- Qdrant Cloud (Free 1GB cluster)
- Cloudflare account (Free Worker Tier)

### Installation

# Clone the repo
git clone https://github.com/YOUR_USERNAME/papertrail-web.git

# Navigate into frontend app directory
cd papertrail-web/apps/web

# Install dependencies
pnpm install

# Setup environment variables
cp .env.local.example .env.local
# Fill in Supabase, Qdrant, Redis, HuggingFace, VAPID keys, etc.

# Run the app locally
pnpm dev

# Environment Variables Examples

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Qdrant
NEXT_PUBLIC_QDRANT_URL=https://your-qdrant-instance.aws.cloud.qdrant.io
NEXT_PUBLIC_QDRANT_API_KEY=your-qdrant-api-key

# Vercel
VERCEL_URL=your-url

# HuggingFace (LLM fallback)
HUGGINGFACE_API_TOKEN=your-huggingface-token
LLAMA3_MODEL=HuggingFaceH4/zephyr-7b-beta

# OpenAI (optional for users providing own keys)
OPENAI_API_KEY=
NEXT_PUBLIC_OPENAI_ENABLED=false

# Upstash Redis (for rate limiting & future background jobs)
UPSTASH_REDIS_REST_URL=your-upstash-redis-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# Web Push (VAPID keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-vapid-key
VAPID_PRIVATE_KEY=your-private-vapid-key

# Analytics (Plausible self-hosted, optional)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=your-domain.com
PLAUSIBLE_API_KEY=your-plausible-server-key



Usage:

Sign up for an account.

Upload documents via drag & drop.

Files are encrypted and uploaded.

OCR and classification automatically run in-browser.

Use search or chat to query your documents.

Enable push notifications for upcoming expirations.

Share documents securely with PIN-protected links.

Contributing:

Contributions are welcome! Please open an issue or submit a pull request to help improve PaperTrail AI.
