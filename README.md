# Quizly Prep 🎯

An AI-powered web application that helps users prepare for interviews by generating personalized quizzes based on the skills in their uploaded résumé.

> 🚀 Live at: [https://quizly-prep.vercel.app](https://quizly-prep.vercel.app/)

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.11-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4.1-646CFF?logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3FCF8E?logo=supabase)](https://supabase.com/)

## 📋 Table of Contents

- [✨ Features](#-features)
- [🚀 Demo](#-demo)
- [🛠️ Technology Stack](#️-technology-stack)
- [⚡ Quick Start](#-quick-start)
- [🔧 Environment Setup](#-environment-setup)
- [📁 Project Structure](#-project-structure)
- [🎨 UI Components](#-ui-components)
- [🔐 Authentication](#-authentication)
- [🤖 AI Integration](#-ai-integration)
- [📱 Mobile Responsive](#-mobile-responsive)
- [🚢 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## ✨ Features

### 📄 **Smart Resume Analysis**
- Upload PDF or DOCX resumes
- Automatic skill extraction using AI
- Context-aware parsing for accurate results
- Support for multiple file formats

### 🧠 **AI-Powered Question Generation**
- Personalized interview questions using Google Gemini AI
- Questions tailored to your specific skills and experience
- Multiple choice format with detailed explanations
- Realistic interview scenarios

### 📊 **Progress Tracking**
- Comprehensive dashboard with performance metrics
- Score tracking and improvement analytics
- Quiz history and completion status
- Personal learning insights

### 💡 **Interactive Learning**
- Real-time quiz taking experience
- Instant feedback with explanations
- Progressive difficulty based on skills
- Review incorrect answers with detailed solutions

### 📱 **Mobile-First Design**
- Fully responsive across all devices
- Touch-friendly interface
- Optimized for mobile and tablet usage
- Progressive Web App (PWA) capabilities

## 🚀 Demo

🔗 **Live Demo**: [Quizly Prep](https://your-deployment-url.com)

### Screenshots

| Homepage | Dashboard | Quiz Interface |
|----------|-----------|----------------|
| ![Homepage](docs/images/homepage.png) | ![Dashboard](docs/images/dashboard.png) | ![Quiz](docs/images/quiz.png) |

## 🛠️ Technology Stack

### **Frontend**
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful and accessible UI components

### **Backend & Services**
- **Supabase** - Backend-as-a-Service (Auth, Database, Storage)
- **PostgreSQL** - Robust relational database
- **Google Gemini AI** - Advanced AI for question generation
- **Supabase Edge Functions** - Serverless functions for resume parsing

### **Development Tools**
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Git** - Version control
- **npm** - Package management

## ⚡ Quick Start

### Prerequisites

- **Node.js** 18+ and npm (or use [nvm](https://github.com/nvm-sh/nvm))
- **Git** for version control
- **Supabase account** for backend services
- **Google AI API key** for Gemini integration

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/VarunArora31/Quizly-Prep.git
   cd Quizly-Prep
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your keys (see [Environment Setup](#-environment-setup))

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

### Build for Production

```bash
npm run build
npm run preview
```

## 🔧 Environment Setup

### 🔐 **Security Note**
This project uses environment variables to keep sensitive credentials secure. The `.env` file is automatically ignored by Git to prevent accidental exposure of API keys.

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google AI Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key

# Supabase Project Configuration
SUPABASE_PROJECT_ID=your_supabase_project_id
```

### 🛡️ **Security Best Practices**
- Never commit `.env` files to version control
- Use `.env.example` as a template for required environment variables
- Regenerate API keys if accidentally exposed
- Use different API keys for development and production

### Getting API Keys

#### **Supabase Setup**
1. Go to [Supabase](https://supabase.com) and create a new project
2. Navigate to Settings → API
3. Copy your `Project URL` and `anon public` key
4. Set up the database schema using the provided SQL scripts

#### **Google AI Setup**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key for Gemini
3. Copy the API key to your environment file

## 📁 Project Structure

```
Quizly-Prep/
├── 📁 public/                 # Static assets
│   ├── favicon.svg           # Custom favicon
│   ├── logo.svg             # App logo
│   └── manifest.json        # PWA manifest
├── 📁 src/
│   ├── 📁 components/        # React components
│   │   ├── 📁 ui/           # shadcn/ui components
│   │   ├── Header.tsx       # Navigation header
│   │   ├── Hero.tsx         # Landing page hero
│   │   ├── Quiz.tsx         # Quiz interface
│   │   └── ResumeUpload.tsx # File upload component
│   ├── 📁 hooks/            # Custom React hooks
│   ├── 📁 integrations/     # External service integrations
│   ├── 📁 lib/              # Utility functions
│   ├── 📁 pages/            # Page components
│   ├── 📁 services/         # API services
│   └── 📁 types/            # TypeScript type definitions
├── 📁 supabase/             # Supabase configuration
│   └── 📁 functions/        # Edge functions
│       ├── generate-quiz/   # AI quiz generation
│       └── parse-resume/    # Resume parsing
├── package.json             # Dependencies and scripts
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## 🎨 UI Components

Quizly Prep uses a comprehensive design system built with **shadcn/ui** and **Tailwind CSS**:

- **Responsive Design**: Mobile-first approach with breakpoints
- **Dark Mode Support**: Built-in theme switching
- **Accessibility**: WCAG compliant components
- **Consistent Styling**: Unified color palette and typography

### Key Components
- `Header` - Navigation with authentication
- `Hero` - Landing page with feature showcase
- `ResumeUpload` - Drag & drop file upload
- `Quiz` - Interactive quiz interface
- `Dashboard` - User progress and quiz management

## 🔐 Authentication

Secure authentication powered by **Supabase Auth**:

- Email/password authentication
- Secure session management
- Protected routes and components
- User profile management

## 🤖 AI Integration

### Resume Parsing
- **Client-side fallback** for basic text extraction
- **Server-side processing** for PDF/DOCX files
- **Context-aware skill detection** using NLP techniques

### Question Generation
- **Google Gemini AI** for intelligent question creation
- **Skill-specific prompting** for relevant content
- **Structured output** for consistent quiz format

## 📱 Mobile Responsive

Optimized for all screen sizes:

- **xs (475px)**: Small phones
- **sm (640px)**: Large phones
- **md (768px)**: Tablets
- **lg (1024px)**: Small desktops
- **xl (1280px+)**: Large screens

Features:
- Touch-friendly interface
- Adaptive layouts
- Optimized content for mobile
- Fast loading on mobile networks

## 🚢 Deployment

### Recommended Platforms

1. **Vercel** (Recommended)
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Netlify**
   ```bash
   npm run build
   # Upload dist/ folder to Netlify
   ```

3. **Supabase Hosting**
   ```bash
   npm run build
   # Deploy through Supabase dashboard
   ```

### Environment Variables for Production
Make sure to set all environment variables in your deployment platform.

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit with conventional commits**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
5. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by [Varun Arora](https://github.com/VarunArora31)**

[⭐ Star this repo](https://github.com/VarunArora31/Quizly-Prep) • [🐛 Report Bug](https://github.com/VarunArora31/Quizly-Prep/issues) • [💡 Request Feature](https://github.com/VarunArora31/Quizly-Prep/issues)

</div>
