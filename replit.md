# Overview

This is a comprehensive **Indian Stock Market Chatbot Web App** called **StockGuru** - an AI-powered stock analysis platform designed to serve as a one-stop solution for Indian stock market insights. The application combines real-time stock data, technical analysis, sentiment analysis, and AI-powered chatbot capabilities to help users make informed investment decisions.

The platform provides features including stock quotes, technical indicators (RSI, MACD, Bollinger Bands), historical data visualization, watchlist management, news sentiment analysis, and an intelligent chatbot that can answer queries about Indian stocks using natural language processing.

# User Preferences

Preferred communication style: Simple, everyday language.

## Recent User Requests  
- 2025-08-19: ✅ Created comprehensive webhook integration system with chatbot widget for external websites
- 2025-08-19: ✅ Built chatbot-widget.js with iframe and floating button support for easy client integration
- 2025-08-19: ✅ Updated webhook.md with detailed local development and production deployment instructions
- 2025-08-19: ✅ Added chatbot iframe route and static file serving for external website integration
- 2025-08-19: ✅ Successfully implemented intelligent 5-step query analysis workflow with live data integration
- 2025-08-19: ✅ Added QueryAnalyzer with enhanced stock symbol detection for Indian stocks (RELIANCE, SBIN, etc.)
- 2025-08-19: ✅ Built IntelligentChatService with real-time market data fetching and Yahoo Finance API integration
- 2025-08-19: ✅ Enhanced chat system to distinguish between market data, explanation, and mixed queries with accurate routing
- 2025-08-18: Removed portfolio value and P&L tracking since app doesn't support deposits
- 2025-08-18: Enhanced AI chatbot window to be larger and more user-friendly
- 2025-08-18: Made sidebar collapsible with smooth animations and toggle functionality
- 2025-08-18: Removed NIFTY 50, Active Stocks, and AI Insights cards to focus on stock data first
- 2025-08-18: Fixed chart visibility with working bar chart visualization
- 2025-08-18: Created comprehensive README.md documenting entire application architecture, data sources, and workflows

# System Architecture

## Frontend Architecture
The client-side is built using **React 18** with **TypeScript** and follows a modern component-based architecture:
- **Vite** as the build tool for fast development and optimized production builds
- **Tailwind CSS** with **shadcn/ui** component library for consistent, accessible UI components
- **Wouter** for lightweight client-side routing
- **React Query (TanStack Query)** for efficient server state management and caching
- Component structure organized into logical modules: Dashboard, Layout, Chat, and UI components

## Backend Architecture
The server-side uses **Node.js** with **Express.js** following a service-oriented architecture:
- **Express.js** REST API with middleware for logging and error handling
- **Service layer pattern** with dedicated services for stocks, AI, and news
- **In-memory storage** implementation with interfaces for future database migration
- **Modular route structure** organized by feature domains

## Data Storage Strategy
The application uses a **dual-storage approach**:
- **In-memory storage** (MemStorage class) for development and immediate functionality
- **PostgreSQL integration** configured via Drizzle ORM for production scalability
- **Schema-first design** using Drizzle with Zod validation for type safety
- Database tables include: users, watchlist_items, stock_alerts, and chat_messages

## Authentication & Session Management
- **Cookie-based session management** using express-session
- **PostgreSQL session store** (connect-pg-simple) for persistent sessions
- User management with bcrypt password hashing (configured but not fully implemented)

## AI Integration Architecture
- **Intelligent 5-Step Query Workflow**: Input → Query Analyzer (LLM classification) → Execution Layer → Summarization → Output
- **LLM-Based Query Classification**: Automatically categorizes queries as Market Data, General Explanation, or Mixed
- **Smart Execution Routing**: Market data queries use APIs, explanations use direct LLM, mixed queries combine both
- **OpenAI GPT-4o** integration for intelligent chat responses and stock analysis
- **Contextual AI responses** that understand stock market terminology and Indian market specifics
- **QueryAnalyzer Service**: Classifies user queries with confidence scoring and stock symbol extraction
- **IntelligentChatService**: Orchestrates the complete workflow with execution step tracking

## Technical Analysis Engine
- **Real-time calculation** of technical indicators (RSI, MACD, Bollinger Bands, SMA, EMA)
- **Historical data processing** with multiple timeframe support (1D, 5D, 1M, 6M, 1Y)
- **Caching strategy** for expensive calculations to improve performance

# External Dependencies

## Stock Market Data APIs
- **Primary**: NSE/BSE APIs or web scraping for authentic Indian stock data
- **Fallback**: Yahoo Finance, Alpha Vantage, or Finnhub for backup data sources
- **Government sources**: SEBI and RBI for regulatory information

## AI & ML Services
- **OpenAI API** (GPT-4o model) for natural language processing and stock analysis
- **FinBERT or custom sentiment models** for news sentiment analysis
- **Machine learning frameworks** planned for predictive modeling (ARIMA, LSTM, XGBoost)

## News & Information APIs
- **NewsAPI.org** for general financial news
- **RSS feeds** from Economic Times, Business Standard, LiveMint
- **Social media APIs** for sentiment analysis from Twitter/Reddit (planned)

## Database & Infrastructure
- **PostgreSQL** (Neon serverless) for production data storage
- **Drizzle ORM** with migrations for database schema management
- **Session storage** using connect-pg-simple for PostgreSQL

## UI & Development Tools
- **shadcn/ui** component library with Radix UI primitives
- **Tailwind CSS** for styling with custom color scheme
- **Lucide React** for consistent iconography
- **React Hook Form** with Zod validation for form handling

## Development & Build Tools
- **TypeScript** for type safety across the full stack
- **Vite** with React plugin for fast development
- **ESBuild** for production server bundling
- **tsx** for TypeScript execution in development