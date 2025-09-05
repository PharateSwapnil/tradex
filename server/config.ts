
import 'dotenv/config';

export const config = {
  // Core Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  HOST: process.env.HOST || '0.0.0.0',
  
  // AI/LLM Configuration
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  
  // News & Market Data
  TAVILY_API_KEY: process.env.TAVILY_API_KEY || '',
  
  // Chart Generation
  CHART_IMG_API_KEY: process.env.CHART_IMG_API_KEY || '',
  
  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL || '',
  
  // Security Configuration
  SESSION_SECRET: process.env.SESSION_SECRET || 'default-secret-change-in-production',
  CORS_ORIGINS: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5000'],
  
  // External API Endpoints
  YAHOO_FINANCE_BASE_URL: process.env.YAHOO_FINANCE_BASE_URL || 'https://query1.finance.yahoo.com',
  GROQ_API_BASE_URL: process.env.GROQ_API_BASE_URL || 'https://api.groq.com/openai/v1',
  TAVILY_API_BASE_URL: process.env.TAVILY_API_BASE_URL || 'https://api.tavily.com',
  CHART_IMG_API_BASE_URL: process.env.CHART_IMG_API_BASE_URL || 'https://api.chart-img.com/v2/tradingview/advanced-chart',
  
  // Performance Configuration
  API_TIMEOUT: parseInt(process.env.API_TIMEOUT || '30000', 10),
  CHART_GENERATION_TIMEOUT: parseInt(process.env.CHART_GENERATION_TIMEOUT || '45000', 10),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  CACHE_TTL_SECONDS: parseInt(process.env.CACHE_TTL_SECONDS || '300', 10),
  NEWS_CACHE_TTL_SECONDS: parseInt(process.env.NEWS_CACHE_TTL_SECONDS || '300', 10),
  MARKET_DATA_CACHE_TTL_SECONDS: parseInt(process.env.MARKET_DATA_CACHE_TTL_SECONDS || '30', 10),
  
  // Development flags
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// Validate required environment variables
const requiredEnvVars = ['GROQ_API_KEY', 'OPENAI_API_KEY'];

if (config.isProduction) {
  for (const envVar of requiredEnvVars) {
    if (!config[envVar as keyof typeof config]) {
      console.warn(`Warning: ${envVar} is not set. Some features may not work properly.`);
    }
  }
}
