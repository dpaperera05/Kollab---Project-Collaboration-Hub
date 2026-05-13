# 🚀 Kollab – AI Powered Project Collaboration & Career Readiness Platform

![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![FastAPI](https://img.shields.io/badge/AI%2FML-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Frontend%20Hosting-Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![Render](https://img.shields.io/badge/Backend%20Hosting-Render-000000?style=for-the-badge&logo=render&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)

---

## 🌟 Overview

**Kollab** is an **AI Powered Project Collaboration and Career Readiness Platform** developed to help students, graduates, beginners, and entry-level professionals gain practical experience, collaborate on real-world projects, build evidence-based portfolios, access mentorship, and improve their employability.

The platform combines project discovery, collaboration tools, AI/ML-based recommendations, semantic smart search, job simulation challenges, AI career assistance, mentorship, portfolios, community engagement, and job market insights into one complete career-readiness ecosystem.

---

## 🎯 Problem Statement

Many students and early-career professionals struggle to move from academic learning to industry expectations. Although they may complete coursework and technical modules, they often lack structured opportunities to:

- work on real-world collaborative projects,
- demonstrate verified evidence of practical skills,
- receive career guidance from mentors,
- understand current industry skill demand,
- practise workplace-style tasks,
- and build a professional portfolio.

**Kollab** addresses this gap by providing a platform where users can discover projects, join teams, collaborate, receive AI-supported recommendations, complete job simulations, access mentorship, and use job market insights to become more career-ready.

---

## ✨ Key Features

### 🔍 Project Discovery and Posting

Users can browse open projects, view project details, explore required roles, check technologies, and apply for suitable opportunities.

Project owners can create project listings with role requirements, skill expectations, difficulty levels, and project information.

---

### 🤝 Team Collaboration Workspace

Kollab provides a collaboration workspace where project members can work together after joining a project.

Main collaboration features include:

- project group chat,
- Kanban-style task management,
- team coordination,
- role-based collaboration,

---

### 🧠 AI/ML Project Recommendation System

Kollab includes a hybrid AI/ML-powered recommendation system that suggests suitable projects to users based on their profile.

The recommendation system uses:

- semantic embeddings,
- cosine similarity,
- and rule-based matching.

Logged-in users receive personalised project recommendations, while guests see the latest available projects.

---

### 🔎 AI Smart Search

Kollab includes an AI-powered semantic smart search feature across:

- projects,
- mentors,
- and people/members.

Unlike normal keyword search, the smart search understands the meaning behind a query and returns more relevant results.

Example:

```text
Search Query: "React frontend developer interested in UI design"
```

The system can identify related projects, mentors, or members even if the exact words are not directly repeated in the data.

---

### 🧑‍🏫 Mentorship

The mentorship module allows users to discover mentors, view mentor profiles, and book mentorship sessions.

Mentors can support users with:

- career guidance,
- technical guidance,
- project advice,
- portfolio improvement,
- and professional development.

---

### 🧾 Evidence-Based Portfolios

Kollab helps users build portfolios based on real evidence instead of only listing skills.

Portfolio evidence can include:

- completed projects,
- project contributions,
- job simulation results,
- skills,
- achievements,
- and readiness progress.

This allows users to demonstrate practical ability more clearly to mentors, recruiters, and project owners.

---

### 🧪 Job Simulation Challenges

Kollab includes guided job simulation challenges that help users practise workplace-style tasks.

The simulation feature includes:

- scenario-based questions,
- multi-select tasks,
- ordering tasks,
- code review tasks,
- UI review tasks,
- written responses,
- rule-based grading,
- AI-assisted rubric grading,
- XP,
- badges,
- feedback,
- and portfolio eligibility indicators.

---

### 💬 AI Chat Assistant

Kollab includes a floating AI-powered chat assistant that helps users understand and use the platform.

The assistant can support users with:

- project discovery guidance,
- recommendation explanations,
- portfolio advice,
- mentorship guidance,
- job simulation support,
- job market insight explanations,
- and general career-readiness guidance.

The AI assistant is connected through a secure backend service so that API keys and AI credentials are not exposed to the frontend.

---

### 📊 Job Market Insights

Kollab includes a job market insights dashboard supported by an automated data pipeline.

The pipeline collects and processes technology-related job postings, then extracts useful information such as:

- job roles,
- companies,
- seniority levels,
- required skills,
- technologies,
- work modes,
- and role categories.

The separate job market data analysis pipeline repository is available here:

🔗 **[Kollab AI/ML Job Market Pipeline Repository](https://github.com/dpaperera05/Kollab-AI-ML-Pipeline.git)**

---

### 🧑‍🤝‍🧑 Community and Events

Kollab also supports community engagement through:

- events,
- blogs,
- discussions,
- comments,
- and community-based learning opportunities.

This helps users stay connected with other learners, mentors, and project contributors.

---

## 🧠 AI/ML Features Summary

| Feature | Description |
|---|---|
| 🧠 Project Recommendations | Hybrid recommendation system using semantic embeddings and rule-based profile matching |
| 🔎 Smart Search | Query-based semantic search across projects, mentors, and members |
| 💬 AI Chat Assistant | AI-powered assistant for platform guidance and career-readiness support |
| 🧪 AI-Assisted Simulation Grading | Written simulation responses are graded using rubric-based AI evaluation |
| 📊 Job Market Insights | Automated job data processing pipeline for job market trend analysis |

---

## 🏗️ System Architecture

Kollab follows a modular full-stack architecture.

```text
Kollab Platform
│
├── Frontend
│   └── React + Vite + TypeScript + Tailwind CSS
│
├── Backend API
│   └── Node.js + Express + TypeScript
│
├── Database
│   └── MongoDB Atlas
│
├── AI/ML Services
│   ├── Python FastAPI Embedding Service
│   ├── Sentence Transformers
│   └── GitHub Models Integration
│
├── Job Market Insights Pipeline
│   ├── n8n Workflow Automation
│   ├── Python Processing Service
│   ├── Cloudflare R2 Storage
│   └── MongoDB Job Market Collection
│
└── Deployment
    ├── Cloudflare Pages
    ├── Render
    └── MongoDB Atlas
```

---

## 🛠️ Tech Stack

### 🎨 Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Radix UI
- Framer Motion

### ⚙️ Backend

- Node.js
- Express.js
- TypeScript
- MongoDB Atlas
- Mongoose
- JWT Authentication
- REST API Architecture

### 🧠 AI/ML and Intelligence Layer

- Python
- FastAPI
- Sentence Transformers
- `all-MiniLM-L6-v2`
- Cosine Similarity
- GitHub Models
- AI-assisted rubric grading

### 📊 Job Market Pipeline

- n8n Workflow Automation
- Python Processing Service
- FastAPI
- Cloudflare R2
- MongoDB Atlas
- Render

Pipeline repository:

🔗 [Kollab AI/ML Job Market Pipeline](https://github.com/dpaperera05/Kollab-AI-ML-Pipeline.git)

### ☁️ Deployment and Infrastructure

- Cloudflare Pages
- Render
- MongoDB Atlas
- Cloudflare R2
- GitHub Actions

---

## 📁 Project Structure

```text
Kollab/
│
├── app/
│   ├── frontend/
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   │
│   ├── backend/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── server.ts
│   │   └── package.json
│   │
│   └── embedding-service/
│       ├── app.py
│       ├── requirements.txt
│       └── README.md
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── README.md
└── .gitignore
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-kollab-main-repository-url>
cd Kollab
```

---

## 🎨 Frontend Setup

Navigate to the frontend folder:

```bash
cd app/frontend
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The frontend usually runs on:

```text
http://localhost:5173
```

---

## ⚙️ Backend Setup

Navigate to the backend folder:

```bash
cd app/backend
```

Install dependencies:

```bash
npm install
```

Run the backend server:

```bash
npm run dev
```

The backend usually runs on:

```text
http://localhost:5000
```

---

## 🧠 Embedding Service Setup

The embedding service is used for AI-powered project recommendations and smart search.

Navigate to the embedding service folder:

```bash
cd app/embedding-service
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Run the FastAPI service:

```bash
uvicorn app:app --reload
```

The embedding service usually runs on:

```text
http://localhost:8000
```

---

## 🌍 Deployment

Kollab is designed for cloud deployment using the following platforms:

| Component | Platform |
|---|---|
| Frontend | Cloudflare Pages |
| Backend API | Render |
| Embedding Service | Render |
| Job Market Pipeline API | Render |
| Database | MongoDB Atlas |
| Object Storage | Cloudflare R2 |

---

