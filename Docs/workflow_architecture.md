
# StockGuru - Workflow & Architecture Design Document

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Application Workflow Diagrams](#application-workflow-diagrams)
3. [Data Flow Architecture](#data-flow-architecture)
4. [Component Interaction Workflows](#component-interaction-workflows)
5. [AI Processing Workflows](#ai-processing-workflows)
6. [Integration Workflows](#integration-workflows)
7. [User Journey Workflows](#user-journey-workflows)
8. [Deployment & Infrastructure Workflows](#deployment--infrastructure-workflows)

## System Architecture Overview

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                          Web Browser / Mobile                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│  │   Dashboard     │  │  Chat Interface │  │  External Widget│           │
│  │   Components    │  │   Components    │  │   Integration   │           │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘           │
└─────────────────────────────────────────────────────────────────────────────┘
                                   │
                            HTTP/WebSocket/PostMessage
                                   │
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                      React 18 + TypeScript Frontend                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│  │   UI Components │  │  State Mgmt     │  │  Data Fetching  │           │
│  │   (shadcn/ui)   │  │ (React Query)   │  │  (TanStack)     │           │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│  │   Routing       │  │   Charting      │  │   Animations    │           │
│  │   (Wouter)      │  │   (Recharts)    │  │ (Framer Motion) │           │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘           │
└─────────────────────────────────────────────────────────────────────────────┘
                                   │
                              REST API / WebSocket
                                   │
┌─────────────────────────────────────────────────────────────────────────────┐
│                          APPLICATION LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                        Express.js API Server                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│  │   Route         │  │   Middleware    │  │   WebSocket     │           │
│  │   Handlers      │  │   Pipeline      │  │   Server        │           │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│  │   Auth          │  │   CORS          │  │   Session       │           │
│  │   Management    │  │   Security      │  │   Management    │           │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘           │
└─────────────────────────────────────────────────────────────────────────────┘
                                   │
                              Service Layer
                                   │
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BUSINESS LOGIC LAYER                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│  │   Stock         │  │   AI Service    │  │   News          │           │
│  │   Service       │  │   Integration   │  │   Service       │           │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│  │   Intelligent   │  │   Query         │  │   Technical     │           │
│  │   Chat Service  │  │   Analyzer      │  │   Analysis      │           │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘           │
└─────────────────────────────────────────────────────────────────────────────┘
                                   │
                              Data Access Layer
                                   │
┌─────────────────────────────────────────────────────────────────────────────┐
│                             DATA LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│  │   PostgreSQL    │  │   In-Memory     │  │   Session       │           │
│  │   Database      │  │   Cache         │  │   Storage       │           │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│  │   External      │  │   AI Provider   │  │   News          │           │
│  │   Stock APIs    │  │   APIs          │  │   APIs          │           │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Architecture Diagram

```
StockGuru Application
├── Frontend (React + TypeScript)
│   ├── Layout Components
│   │   ├── Header (Search, Navigation)
│   │   └── Sidebar (Collapsible Navigation)
│   ├── Dashboard Components
│   │   ├── QuickStats (Market Overview)
│   │   ├── StockChart (Price Visualization)
│   │   ├── TechnicalIndicators (RSI, MACD, etc.)
│   │   ├── Watchlist (Portfolio Management)
│   │   └── NewsAndAlerts (Market Updates)
│   └── Chat Components
│       ├── FloatingChatbot (Overlay Interface)
│       ├── IntegratedChatbot (Dashboard Chat)
│       └── StockSearchChatbot (Widget Interface)
├── Backend (Express.js + TypeScript)
│   ├── Route Handlers
│   │   ├── /api/stocks (Stock data endpoints)
│   │   ├── /api/chat (AI chat endpoints)
│   │   ├── /api/news (News & sentiment)
│   │   └── /api/watchlist (User management)
│   ├── Services Layer
│   │   ├── StockService (Market data processing)
│   │   ├── IntelligentChatService (5-step workflow)
│   │   ├── QueryAnalyzer (LLM classification)
│   │   ├── AIService (Multi-provider integration)
│   │   └── NewsService (Sentiment analysis)
│   └── Data Access Layer
│       ├── Database Operations (Drizzle ORM)
│       ├── Cache Management (In-memory)
│       └── External API Integration
└── External Integrations
    ├── Widget System (iframe + postMessage)
    ├── Yahoo Finance API (Stock data)
    ├── Groq/OpenAI APIs (AI processing)
    └── Tavily API (News aggregation)
```

## Application Workflow Diagrams

### Main Application Workflow

```mermaid
graph TD
    A[User Access] --> B{User Authentication}
    B -->|New User| C[Registration Process]
    B -->|Existing User| D[Load Dashboard]
    C --> E[Profile Setup]
    E --> D
    D --> F[Display Market Overview]
    F --> G[User Interaction]
    G --> H{Action Type}
    H -->|Stock Search| I[Stock Data Retrieval]
    H -->|Chat Query| J[AI Chat Processing]
    H -->|Watchlist| K[Portfolio Management]
    H -->|News| L[News & Sentiment Analysis]
    I --> M[Technical Analysis]
    M --> N[Chart Rendering]
    J --> O[AI Response Generation]
    K --> P[Watchlist Updates]
    L --> Q[News Display]
    N --> R[User Interface Update]
    O --> R
    P --> R
    Q --> R
    R --> G
```

### Real-time Data Update Workflow

```mermaid
graph LR
    A[Market Status Check] --> B[Scheduler Trigger]
    B --> C{Market Open?}
    C -->|Yes| D[Data Fetch Queue]
    C -->|No| E[Wait for Market Open]
    D --> F[Parallel API Calls]
    F --> G[Data Processing]
    G --> H[Cache Update]
    H --> I[WebSocket Broadcast]
    I --> J[UI Refresh]
    E --> A
    J --> K[Next Cycle]
    K --> B
```

## Data Flow Architecture

### Frontend Data Flow Pattern

```
User Interaction
       ↓
Event Handler (React)
       ↓
State Update Trigger
       ↓
TanStack Query (useQuery/useMutation)
       ↓
HTTP Request to Backend
       ↓
API Response Processing
       ↓
Cache Update (stale-while-revalidate)
       ↓
React State Update
       ↓
Component Re-render
       ↓
UI Update with New Data
```

### Backend Data Processing Flow

```
API Request Receipt
       ↓
Request Validation & Authentication
       ↓
Route Handler Execution
       ↓
Service Layer Business Logic
       ↓
Data Source Selection (Cache vs External API)
       ↓
Data Processing & Transformation
       ↓
Business Logic Application
       ↓
Response Formatting
       ↓
Cache Update (if applicable)
       ↓
HTTP Response to Client
```

### Database Transaction Flow

```
Database Request
       ↓
Connection Pool Management
       ↓
Transaction Begin
       ↓
SQL Query Execution
       ↓
Data Validation
       ↓
Business Rule Enforcement
       ↓
Commit/Rollback Decision
       ↓
Connection Return to Pool
       ↓
Response to Service Layer
```

## Component Interaction Workflows

### Stock Data Retrieval Workflow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant S as StockService
    participant Y as Yahoo Finance API
    participant C as Cache

    U->>F: Search for stock symbol
    F->>B: GET /api/stocks/RELIANCE
    B->>S: getStock(RELIANCE)
    S->>C: Check cache for RELIANCE
    alt Cache Hit
        C-->>S: Return cached data
    else Cache Miss
        S->>Y: Fetch stock data
        Y-->>S: Stock data response
        S->>S: Process & calculate technical indicators
        S->>C: Store in cache
    end
    S-->>B: Return stock data
    B-->>F: JSON response
    F->>F: Update UI components
    F-->>U: Display stock information
```

### Chat Processing Workflow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Chat Interface
    participant I as IntelligentChatService
    participant Q as QueryAnalyzer
    participant S as StockService
    participant A as AI Service

    U->>C: Send message: "What's RELIANCE stock price?"
    C->>I: processQuery(message)
    I->>Q: analyzeQuery(message)
    Q->>A: Classify query type
    A-->>Q: "market_data" with symbol "RELIANCE"
    Q-->>I: Classification result
    I->>S: getStock("RELIANCE")
    S-->>I: Stock data
    I->>A: Generate response with data
    A-->>I: Formatted response
    I-->>C: Chat response with suggestions
    C-->>U: Display AI response
```

## AI Processing Workflows

### 5-Step Intelligent Query Workflow

```mermaid
graph TD
    A[User Input] --> B[Step 1: Input Processing]
    B --> C[Text Normalization & Preprocessing]
    C --> D[Step 2: Query Classification]
    D --> E{Classification Result}
    E -->|Market Data| F[Step 3A: Market Data Route]
    E -->|General Explanation| G[Step 3B: AI Explanation Route]
    E -->|Mixed Query| H[Step 3C: Combined Route]
    F --> I[Fetch Stock Data]
    G --> J[Generate AI Explanation]
    H --> K[Parallel Processing]
    I --> L[Step 4: AI Summarization]
    J --> L
    K --> L
    L --> M[Context Integration]
    M --> N[Step 5: Response Generation]
    N --> O[Format for UI Display]
    O --> P[Return to User]
```

### AI Provider Fallback Strategy

```mermaid
graph TD
    A[AI Request] --> B[Primary: Groq API]
    B --> C{Request Successful?}
    C -->|Yes| D[Return Response]
    C -->|No| E[Log Groq Failure]
    E --> F[Fallback: OpenAI API]
    F --> G{Request Successful?}
    G -->|Yes| H[Return Response]
    G -->|No| I[Log All Failures]
    I --> J[Return Error Response]
    D --> K[Cache Response]
    H --> K
    J --> L[Alert System]
```

## Integration Workflows

### External Widget Integration Flow

```mermaid
graph TD
    A[External Website] --> B[Load Widget Script]
    B --> C[Initialize Configuration]
    C --> D[Create iframe Container]
    D --> E[Establish PostMessage Channel]
    E --> F[Load StockGuru Widget]
    F --> G[Render Chat Interface]
    G --> H[User Interaction]
    H --> I[PostMessage to Parent]
    I --> J[Process in Parent Context]
    J --> K[Update Widget Display]
    K --> H
```

### API Integration Workflow

```mermaid
sequenceDiagram
    participant E as External Client
    participant A as API Gateway
    participant R as Rate Limiter
    participant S as Service Layer
    participant D as Data Sources

    E->>A: API Request with Key
    A->>A: Validate API Key
    A->>R: Check Rate Limits
    alt Rate Limit Exceeded
        R-->>A: Rate Limit Error
        A-->>E: HTTP 429 Response
    else Within Limits
        R->>S: Forward Request
        S->>D: Fetch Data
        D-->>S: Return Data
        S->>S: Process & Format
        S-->>A: Formatted Response
        A-->>E: HTTP 200 + Data
    end
```

## User Journey Workflows

### New User Onboarding Journey

```
Landing Page
     ↓
Sign Up Process
     ↓
Email Verification
     ↓
Profile Setup
     ↓
Dashboard Introduction
     ↓
First Stock Search
     ↓
Tutorial Overlay
     ↓
Watchlist Creation
     ↓
Chat Interface Demo
     ↓
Feature Discovery
     ↓
Regular Usage Pattern
```

### Daily User Workflow

```mermaid
graph TD
    A[User Login] --> B[Dashboard Load]
    B --> C[Check Watchlist]
    C --> D[Review Market Status]
    D --> E{Market Hours?}
    E -->|Yes| F[Active Trading Mode]
    E -->|No| G[Analysis Mode]
    F --> H[Real-time Data Monitoring]
    G --> I[Historical Analysis]
    H --> J[Stock Analysis]
    I --> J
    J --> K[AI Consultation]
    K --> L[Trading Decisions]
    L --> M[Update Watchlist]
    M --> N[Set Alerts]
    N --> O[Session End]
```

## Deployment & Infrastructure Workflows

### Replit Deployment Workflow

```mermaid
graph TD
    A[Code Push to Repository] --> B[Automatic Build Trigger]
    B --> C[Frontend Build Process]
    C --> D[Backend Compilation]
    D --> E[Environment Variable Setup]
    E --> F[Database Migration Check]
    F --> G{Migrations Needed?}
    G -->|Yes| H[Run Database Migrations]
    G -->|No| I[Skip Migrations]
    H --> J[Health Check Execution]
    I --> J
    J --> K{All Services Healthy?}
    K -->|Yes| L[Deploy to Production]
    K -->|No| M[Rollback to Previous Version]
    L --> N[Update DNS Routing]
    N --> O[Monitor Deployment]
    M --> P[Alert Development Team]
```

### System Health Monitoring Workflow

```mermaid
graph TD
    A[Monitoring System] --> B[Health Check Schedule]
    B --> C[Database Connectivity]
    B --> D[External API Status]
    B --> E[Memory Usage Check]
    B --> F[Response Time Analysis]
    C --> G{Check Results}
    D --> G
    E --> G
    F --> G
    G -->|All Green| H[Update Status Dashboard]
    G -->|Issues Detected| I[Severity Assessment]
    I --> J{Critical Issue?}
    J -->|Yes| K[Immediate Alert]
    J -->|No| L[Log Warning]
    K --> M[Escalation Process]
    L --> N[Trend Analysis]
    H --> O[Continue Monitoring]
    M --> O
    N --> O
```

### Error Handling & Recovery Workflow

```mermaid
graph TD
    A[Error Detected] --> B[Error Classification]
    B --> C{Error Type}
    C -->|Network| D[Retry with Backoff]
    C -->|Validation| E[User Feedback]
    C -->|Server| F[Fallback Mechanism]
    C -->|Critical| G[System Alert]
    D --> H{Retry Successful?}
    H -->|Yes| I[Resume Normal Operation]
    H -->|No| J[Escalate to Fallback]
    E --> K[Show Error Message]
    F --> L[Use Cached Data]
    G --> M[Emergency Response]
    I --> N[Log Resolution]
    J --> F
    K --> N
    L --> N
    M --> O[Manual Intervention]
    N --> P[Continue Operation]
```

This comprehensive workflow and architecture design document provides detailed visual representations and explanations of how StockGuru operates at various levels, from user interactions to system-level processes, without including any code snippets. The diagrams illustrate the flow of data, user journeys, and system interactions that make the platform function effectively.

