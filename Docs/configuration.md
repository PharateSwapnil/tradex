
# StockGuru - Configuration & Setup Documentation

## Table of Contents
1. [Environment Configuration](#environment-configuration)
2. [Database Setup](#database-setup)
3. [API Keys & External Services](#api-keys--external-services)
4. [Development Configuration](#development-configuration)
5. [Production Configuration](#production-configuration)
6. [Widget Integration Configuration](#widget-integration-configuration)
7. [Security Configuration](#security-configuration)
8. [Performance Configuration](#performance-configuration)
9. [Monitoring & Logging Configuration](#monitoring--logging-configuration)

## Environment Configuration

### Environment Variables

#### Required Environment Variables
```bash
# Core Configuration
NODE_ENV=development|production
PORT=5000

# Database Configuration
DATABASE_URL=postgresql://username:password@host:5432/database_name

# AI Service Configuration
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-minimum-32-chars
```

#### Optional Environment Variables
```bash
# External API Keys
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEWS_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com

# Rate Limiting Configuration
RATE_LIMIT_FREE=100
RATE_LIMIT_PREMIUM=1000
RATE_LIMIT_ENTERPRISE=-1

# Cache Configuration
CACHE_TTL_STOCK_DATA=60000
CACHE_TTL_TECHNICAL_DATA=300000
CACHE_TTL_NEWS_DATA=900000

# Logging Configuration
LOG_LEVEL=info|debug|warn|error
LOG_FORMAT=json|text

# Feature Flags
ENABLE_REAL_TIME_UPDATES=true
ENABLE_WEBHOOK_ENDPOINTS=true
ENABLE_AI_INSIGHTS=true
```

### Environment File Setup

#### Development Environment (.env.development)
```bash
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://localhost:5432/stockguru_dev
GROQ_API_KEY=your_groq_development_key
OPENAI_API_KEY=your_openai_development_key
SESSION_SECRET=development-session-secret-key-change-in-production
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
LOG_LEVEL=debug
ENABLE_REAL_TIME_UPDATES=true
```

#### Production Environment (.env.production)
```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=${REPLIT_DB_URL}
GROQ_API_KEY=${GROQ_API_KEY}
OPENAI_API_KEY=${OPENAI_API_KEY}
SESSION_SECRET=${SESSION_SECRET}
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
LOG_LEVEL=info
RATE_LIMIT_FREE=100
RATE_LIMIT_PREMIUM=1000
```

## Database Setup

### PostgreSQL Configuration

#### Database Schema Setup
```sql
-- Create database
CREATE DATABASE stockguru_prod;
CREATE DATABASE stockguru_dev;
CREATE DATABASE stockguru_test;

-- Create user with appropriate permissions
CREATE USER stockguru_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE stockguru_prod TO stockguru_user;
GRANT ALL PRIVILEGES ON DATABASE stockguru_dev TO stockguru_user;
```

#### Connection Configuration
```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: process.env.NODE_ENV === 'development',
  strict: true,
});
```

#### Migration Commands
```bash
# Generate migration
npm run db:generate

# Push schema changes
npm run db:push

# Run migrations
npm run db:migrate

# View studio
npm run db:studio
```

### Database Performance Configuration
```typescript
// server/config.ts
export const databaseConfig = {
  pool: {
    min: 2,
    max: 20,
    idle: 10000,
    acquire: 60000,
    evict: 1000
  },
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? {
    require: true,
    rejectUnauthorized: false
  } : false
};
```

## API Keys & External Services

### AI Service Configuration

#### Groq API Setup
```typescript
// server/services/aiService.ts
const groqConfig = {
  apiKey: process.env.GROQ_API_KEY,
  model: 'llama-3.3-70b-versatile',
  maxTokens: 2048,
  temperature: 0.7,
  timeout: 30000,
  retries: 3
};
```

#### OpenAI API Setup (Fallback)
```typescript
// server/services/aiService.ts
const openaiConfig = {
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o',
  maxTokens: 2048,
  temperature: 0.7,
  timeout: 30000,
  organization: process.env.OPENAI_ORG_ID // Optional
};
```

### Stock Data API Configuration

#### Yahoo Finance Configuration
```typescript
// server/services/stockService.ts
const yahooFinanceConfig = {
  baseUrl: 'https://query1.finance.yahoo.com/v8/finance/chart',
  searchUrl: 'https://query2.finance.yahoo.com/v1/finance/search',
  timeout: 10000,
  retries: 3,
  rateLimit: {
    requestsPerMinute: 200,
    burstLimit: 50
  }
};
```

#### Alternative API Configuration
```typescript
// Future implementation
const alternativeAPIs = {
  alphavantage: {
    apiKey: process.env.ALPHA_VANTAGE_API_KEY,
    baseUrl: 'https://www.alphavantage.co/query',
    callsPerMinute: 5 // Free tier
  },
  finnhub: {
    apiKey: process.env.FINNHUB_API_KEY,
    baseUrl: 'https://finnhub.io/api/v1',
    callsPerMinute: 60 // Free tier
  }
};
```

### News API Configuration

#### NewsAPI.org Setup
```typescript
// server/services/newsService.ts
const newsApiConfig = {
  apiKey: process.env.NEWS_API_KEY,
  baseUrl: 'https://newsapi.org/v2',
  sources: [
    'the-times-of-india',
    'google-news-in',
    'business-standard'
  ],
  categories: ['business'],
  country: 'in',
  pageSize: 20
};
```

#### RSS Feed Configuration
```typescript
const rssFeedConfig = {
  feeds: [
    'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms',
    'https://www.business-standard.com/rss/markets-106.rss',
    'https://www.livemint.com/rss/markets'
  ],
  updateInterval: 900000, // 15 minutes
  timeout: 5000
};
```

## Development Configuration

### Local Development Setup

#### Prerequisites Installation
```bash
# Install Node.js 18+
node --version  # Should be 18.0.0 or higher
npm --version   # Should be 8.0.0 or higher

# Install PostgreSQL (if running locally)
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

#### Project Setup Commands
```bash
# Clone repository
git clone <repository-url>
cd stockguru

# Install dependencies
npm install

# Setup environment
cp .env.example .env.development
# Edit .env.development with your configuration

# Setup database
npm run db:generate
npm run db:push

# Start development server
npm run dev
```

### Development Scripts Configuration
```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "cross-env NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

### Development Tools Configuration

#### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"]
    }
  },
  "include": [
    "client/src/**/*",
    "shared/**/*",
    "server/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build"
  ]
}
```

#### Vite Configuration
```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist/public",
    sourcemap: process.env.NODE_ENV === 'development',
    minify: process.env.NODE_ENV === 'production',
  },
});
```

## Production Configuration

### Replit Deployment Configuration

#### Replit Configuration File
```toml
# .replit
[deployment]
run = ["sh", "-c", "npm run build && npm start"]
deploymentTarget = "cloudrun"

[[ports]]
localPort = 5000
externalPort = 80

[[ports]]
localPort = 5000
externalPort = 443

[env]
NODE_ENV = "production"
```

#### Build Configuration
```typescript
// Production build settings
const productionConfig = {
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 5000,
    cors: {
      origin: process.env.CORS_ORIGINS?.split(',') || [],
      credentials: true
    }
  },
  database: {
    url: process.env.DATABASE_URL,
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  session: {
    secret: process.env.SESSION_SECRET,
    secure: true,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};
```

### Performance Optimization Configuration

#### Caching Configuration
```typescript
// server/config.ts
export const cacheConfig = {
  stockData: {
    ttl: 60000, // 1 minute
    maxSize: 1000
  },
  technicalIndicators: {
    ttl: 300000, // 5 minutes
    maxSize: 500
  },
  newsData: {
    ttl: 900000, // 15 minutes
    maxSize: 100
  },
  aiResponses: {
    ttl: 1800000, // 30 minutes
    maxSize: 200
  }
};
```

#### Rate Limiting Configuration
```typescript
// server/middleware/rateLimiting.ts
export const rateLimitConfig = {
  free: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // requests per hour
    message: 'Too many requests from this IP'
  },
  premium: {
    windowMs: 60 * 60 * 1000,
    max: 1000
  },
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false
  }
};
```

## Widget Integration Configuration

### Widget Deployment Configuration

#### Widget Script Configuration
```typescript
// client/public/chatbot-widget.js
const widgetConfig = {
  defaultOptions: {
    theme: 'dark',
    width: '400px',
    height: '600px',
    position: 'bottom-right',
    buttonColor: '#3B82F6',
    borderRadius: '12px'
  },
  apiEndpoint: process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.replit.app/api'
    : 'http://localhost:5000/api',
  iframeUrl: process.env.NODE_ENV === 'production'
    ? 'https://your-domain.replit.app/chatbot'
    : 'http://localhost:5000/chatbot'
};
```

#### CORS Configuration for Widgets
```typescript
// server/middleware/cors.ts
const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow configured origins
    const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // For development, allow localhost
    if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID']
};
```

## Security Configuration

### Authentication Configuration

#### Session Configuration
```typescript
// server/middleware/session.ts
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';

const PgSession = connectPgSimple(session);

export const sessionConfig = {
  store: new PgSession({
    conString: process.env.DATABASE_URL,
    tableName: 'user_sessions',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  },
  name: 'stockguru.sid'
};
```

#### Password Security Configuration
```typescript
// server/utils/security.ts
export const securityConfig = {
  bcrypt: {
    saltRounds: 12
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '24h',
    algorithm: 'HS256'
  },
  rateLimit: {
    login: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per window
      skipSuccessfulRequests: true
    }
  }
};
```

### Input Validation Configuration

#### Zod Schema Configuration
```typescript
// shared/validation.ts
import { z } from 'zod';

export const validationSchemas = {
  stockSymbol: z.string()
    .min(1)
    .max(20)
    .regex(/^[A-Z0-9]+$/, 'Invalid stock symbol format'),
    
  chatMessage: z.string()
    .min(1)
    .max(1000)
    .trim(),
    
  userId: z.string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid user ID format'),
    
  email: z.string().email(),
  
  password: z.string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number')
};
```

## Performance Configuration

### Database Performance

#### Connection Pool Configuration
```typescript
// server/config/database.ts
export const poolConfig = {
  min: process.env.NODE_ENV === 'production' ? 5 : 2,
  max: process.env.NODE_ENV === 'production' ? 20 : 10,
  idle: 10000,
  acquire: 60000,
  evict: 1000,
  handleDisconnects: true,
  validate: (connection: any) => {
    return connection && connection.state === 'authenticated';
  }
};
```

#### Query Optimization Configuration
```typescript
// server/config/queries.ts
export const queryConfig = {
  timeout: 30000, // 30 seconds
  logging: process.env.NODE_ENV === 'development',
  benchmark: process.env.NODE_ENV === 'development',
  pool: poolConfig,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
};
```

### Caching Strategy Configuration

#### Memory Cache Configuration
```typescript
// server/config/cache.ts
export const memoryCache = {
  max: 500, // Maximum number of items
  ttl: 1000 * 60 * 5, // 5 minutes default TTL
  updateAgeOnGet: true,
  updateAgeOnHas: false,
  checkperiod: 1000 * 60, // Check for expired items every minute
  errorOnMissing: false,
  maxAge: 1000 * 60 * 60 // 1 hour maximum age
};
```

## Monitoring & Logging Configuration

### Logging Configuration

#### Winston Logger Setup
```typescript
// server/config/logging.ts
import winston from 'winston';

export const loggingConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === 'production'
      ? winston.format.json()
      : winston.format.colorize({ all: true })
  ),
  transports: [
    new winston.transports.Console(),
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({ 
        filename: 'logs/error.log', 
        level: 'error' 
      }),
      new winston.transports.File({ 
        filename: 'logs/combined.log' 
      })
    ] : [])
  ]
};
```

### Health Check Configuration

#### Health Monitoring Setup
```typescript
// server/middleware/healthCheck.ts
export const healthCheckConfig = {
  endpoints: {
    '/health': 'basic',
    '/health/detailed': 'detailed',
    '/health/ready': 'readiness',
    '/health/live': 'liveness'
  },
  checks: {
    database: {
      timeout: 5000,
      query: 'SELECT 1'
    },
    externalAPIs: {
      timeout: 3000,
      endpoints: [
        'https://query1.finance.yahoo.com',
        'https://api.groq.com'
      ]
    },
    memory: {
      maxHeapUsed: 0.8, // 80% of available heap
      maxRss: 512 * 1024 * 1024 // 512MB
    }
  }
};
```

This comprehensive configuration documentation provides all the necessary setup instructions and configuration options for deploying and maintaining the StockGuru application in both development and production environments.
