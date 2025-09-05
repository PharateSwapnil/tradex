
# StockGuru - Technical Design Document

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Design](#architecture-design)
3. [Technology Stack](#technology-stack)
4. [Database Design](#database-design)
5. [API Design](#api-design)
6. [AI Integration](#ai-integration)
7. [Security Architecture](#security-architecture)
8. [Performance Considerations](#performance-considerations)
9. [Deployment Architecture](#deployment-architecture)

## System Overview

### Purpose
StockGuru is a comprehensive AI-powered Indian stock market analysis platform that provides real-time stock data, technical analysis, and intelligent chatbot assistance for investment decisions.

### Core Objectives
- Real-time stock market data visualization
- Advanced technical indicator calculations
- AI-powered natural language stock analysis
- Watchlist and portfolio management
- News sentiment analysis
- External chatbot widget integration

### Target Users
- Individual investors
- Financial advisors
- Stock market enthusiasts
- External websites requiring stock analysis widgets

## Architecture Design

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Layer  │    │  External APIs  │    │  AI Services    │
│                 │    │                 │    │                 │
│ • React Frontend│    │ • Yahoo Finance │    │ • Groq API      │
│ • Widget System │    │ • NewsAPI       │    │ • OpenAI        │
│ • Mobile UI     │    │ • NSE/BSE APIs  │    │ • Tavily Search │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────────┐
         │              Application Layer                      │
         │                                                     │
         │ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
         │ │   Express   │  │   Services  │  │   Routes    │   │
         │ │   Server    │  │   Layer     │  │   Handler   │   │
         │ └─────────────┘  └─────────────┘  └─────────────┘   │
         └─────────────────────────────────────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────────┐
         │               Data Layer                            │
         │                                                     │
         │ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
         │ │   Memory    │  │ PostgreSQL  │  │   Session   │   │
         │ │   Storage   │  │  Database   │  │   Store     │   │
         │ └─────────────┘  └─────────────┘  └─────────────┘   │
         └─────────────────────────────────────────────────────┘
```

### Component Architecture

#### Frontend Architecture
```
src/
├── components/
│   ├── Chat/                 # AI Chatbot Components
│   │   ├── IntegratedChatbot.tsx
│   │   ├── FloatingChatbot.tsx
│   │   └── StockSearchChatbot.tsx
│   ├── Dashboard/            # Main Dashboard Components
│   │   ├── StockChart.tsx
│   │   ├── TechnicalIndicators.tsx
│   │   ├── Watchlist.tsx
│   │   └── AIInsights.tsx
│   ├── Layout/               # Layout Components
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   └── ui/                   # Reusable UI Components
├── hooks/                    # Custom React Hooks
│   ├── useStockData.ts
│   └── useChat.ts
├── lib/                      # Utility Libraries
├── types/                    # TypeScript Definitions
└── pages/                    # Page Components
```

#### Backend Architecture
```
server/
├── services/                 # Business Logic Layer
│   ├── stockService.ts       # Stock data operations
│   ├── aiService.ts          # AI integrations
│   ├── intelligentChatService.ts # Smart chat workflow
│   ├── queryAnalyzer.ts      # Query classification
│   └── newsService.ts        # News data operations
├── routes.ts                 # API route definitions
├── storage.ts                # Data persistence layer
├── config.ts                 # Configuration management
└── index.ts                  # Server entry point
```

## Technology Stack

### Frontend Technologies
- **React 18**: Modern component-based UI framework
- **TypeScript**: Type-safe JavaScript development
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Accessible component library
- **Wouter**: Lightweight client-side routing
- **TanStack Query**: Server state management and caching
- **Recharts**: Data visualization library

### Backend Technologies
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **TypeScript**: Type-safe server development
- **Drizzle ORM**: TypeScript-first database toolkit
- **PostgreSQL**: Production database system
- **express-session**: Session management
- **bcrypt**: Password hashing (configured)

### AI & Data Integration
- **Groq API**: Primary AI service (llama-3.3-70b-versatile)
- **OpenAI API**: Secondary AI service (GPT-4o)
- **Yahoo Finance API**: Stock market data
- **Tavily API**: Enhanced news search
- **NewsAPI**: Financial news aggregation

### Development & Build Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler
- **Drizzle Kit**: Database migration tool
- **cross-env**: Cross-platform environment variables

## Database Design

### Schema Overview
The application uses a dual-storage approach with in-memory storage for development and PostgreSQL for production.

#### Core Tables

```sql
-- Users table for authentication
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Watchlist items for user stock tracking
CREATE TABLE watchlist_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  symbol VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock alerts for price notifications
CREATE TABLE stock_alerts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  symbol VARCHAR(50) NOT NULL,
  condition VARCHAR(50) NOT NULL, -- 'above', 'below', 'rsi_oversold', etc.
  target_value DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages for conversation history
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Data Models

```typescript
// Core data interfaces
interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  lastUpdated: string;
}

interface TechnicalIndicators {
  rsi: number;
  macd: number;
  signal: number;
  histogram: number;
  sma20: number;
  ema50: number;
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
}

interface AIInsight {
  symbol: string;
  prediction: {
    direction: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
    targetPrice: number;
    timeframe: string;
  };
  keyFactors: string[];
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
  lastUpdated: string;
}
```

## API Design

### RESTful API Endpoints

#### Stock Data Endpoints
```typescript
GET    /api/stocks/:symbol           # Get stock quote
GET    /api/stocks/:symbol/technical # Get technical indicators
GET    /api/stocks/:symbol/history   # Get historical data
GET    /api/stocks/search/:query     # Search stocks
GET    /api/indices                  # Get market indices
```

#### Chat & AI Endpoints
```typescript
POST   /api/chat                     # Send chat message
GET    /api/chat/history             # Get chat history
GET    /api/insights/:symbol         # Get AI insights
```

#### User Management Endpoints
```typescript
POST   /api/auth/login               # User authentication
POST   /api/auth/logout              # User logout
GET    /api/watchlist                # Get user watchlist
POST   /api/watchlist                # Add to watchlist
DELETE /api/watchlist/:id            # Remove from watchlist
GET    /api/alerts                   # Get user alerts
POST   /api/alerts                   # Create new alert
```

#### Widget Integration Endpoints
```typescript
GET    /chatbot-widget.js            # Widget JavaScript
GET    /chatbot                      # Iframe chatbot page
GET    /static/*                     # Static assets
```

### Request/Response Formats

#### Chat API Example
```typescript
// POST /api/chat
Request: {
  message: string;
  userId: string;
}

Response: {
  id: string;
  response: string;
  suggestions: string[];
  timestamp: string;
  actionType?: 'stock_data' | 'explanation' | 'mixed';
}
```

#### Stock Data Example
```typescript
// GET /api/stocks/RELIANCE
Response: {
  symbol: "RELIANCE",
  name: "Reliance Industries Limited",
  price: 2847.50,
  change: 23.75,
  changePercent: 0.84,
  volume: 12500000,
  marketCap: 1923000000000,
  lastUpdated: "2025-01-19T14:30:00Z"
}
```

## AI Integration

### Intelligent Query Processing Workflow

```
User Input → Query Analyzer → Execution Router → Response Generator → UI Display
```

#### 5-Step AI Workflow
1. **Input Processing**: Sanitize and prepare user query
2. **Query Classification**: Categorize as Market Data, Explanation, or Mixed
3. **Execution Routing**: Route to appropriate data sources or AI services
4. **Response Synthesis**: Combine data and generate intelligent response
5. **Output Formatting**: Format for UI display with suggestions

#### Query Analyzer Service
```typescript
interface QueryAnalysis {
  type: 'market_data' | 'general_explanation' | 'mixed_query';
  confidence: number;
  stockSymbols: string[];
  intent: string;
  requiresRealTimeData: boolean;
}
```

#### AI Service Integration
- **Primary**: Groq API with llama-3.3-70b-versatile model
- **Fallback**: OpenAI GPT-4o for complex analysis
- **Context**: Indian stock market terminology and regulations
- **Response Format**: Structured JSON with action types and suggestions

## Security Architecture

### Authentication & Authorization
- **Session Management**: Express-session with PostgreSQL store
- **Password Security**: bcrypt hashing with salt rounds
- **CORS Configuration**: Configurable allowed origins
- **Rate Limiting**: Per-user API call limits

### Data Security
- **Environment Variables**: Secure API key storage
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Parameterized queries with Drizzle ORM
- **XSS Protection**: Input sanitization and output encoding

### API Security
```typescript
// Rate limiting configuration
const rateLimits = {
  free: 100,      // requests per hour
  premium: 1000,  // requests per hour
  enterprise: -1  // unlimited
};

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || [],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID']
};
```

## Performance Considerations

### Caching Strategy
- **Client-Side**: TanStack Query for API response caching
- **Server-Side**: In-memory caching for frequently accessed data
- **Database**: Connection pooling and query optimization
- **Static Assets**: CDN delivery for widget scripts

### Data Optimization
- **Technical Indicators**: Calculated once and cached
- **Stock Data**: Batch API calls for multiple symbols
- **Historical Data**: Compressed storage and lazy loading
- **Real-time Updates**: WebSocket connections for live data

### Scalability Considerations
```typescript
// Database connection optimization
const dbConfig = {
  max: 20,          // Maximum connections
  min: 2,           // Minimum connections
  idle: 10000,      // Idle timeout
  acquire: 60000,   // Acquire timeout
  evict: 1000       // Eviction interval
};

// Cache configuration
const cacheConfig = {
  stockData: 60000,     // 1 minute
  technicalData: 300000, // 5 minutes
  newsData: 900000,     // 15 minutes
  aiInsights: 1800000   // 30 minutes
};
```

## Deployment Architecture

### Replit Deployment Configuration
```typescript
// Production environment
const productionConfig = {
  port: process.env.PORT || 5000,
  host: '0.0.0.0',
  database: process.env.DATABASE_URL,
  session: {
    secret: process.env.SESSION_SECRET,
    store: 'postgresql',
    secure: true
  }
};
```

### Environment Configuration
```bash
# Required environment variables
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
GROQ_API_KEY=gsk_...
OPENAI_API_KEY=sk-...
SESSION_SECRET=...
CORS_ORIGINS=https://domain1.com,https://domain2.com
```

### Build Process
1. **Frontend Build**: Vite production build with optimization
2. **Backend Build**: esbuild server bundling
3. **Asset Processing**: Static file optimization
4. **Database Migration**: Drizzle schema deployment

### Monitoring & Logging
- **Error Tracking**: Console logging with timestamps
- **Performance Monitoring**: API response time tracking
- **Health Checks**: Database and external API connectivity
- **Usage Analytics**: API call tracking and user metrics

### High Availability
- **Database**: PostgreSQL with connection pooling
- **Sessions**: Persistent session storage
- **Static Assets**: CDN distribution
- **API Resilience**: Fallback mechanisms for external services

This technical design provides a comprehensive foundation for understanding, maintaining, and scaling the StockGuru platform.
