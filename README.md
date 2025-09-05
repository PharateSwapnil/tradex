# StockGuru - AI-Powered Indian Stock Market Analysis Platform

![StockGuru Banner](https://img.shields.io/badge/StockGuru-AI%20Stock%20Analysis-blue?style=for-the-badge&logo=trending-up)

## 🎯 Overview

**StockGuru** is a comprehensive AI-powered web application designed specifically for the Indian stock market. It serves as a one-stop destination for stock analysis, technical indicators, market insights, and intelligent chatbot assistance. The platform combines real-time stock data, advanced technical analysis, and AI-powered natural language processing to help investors make informed decisions about NSE and BSE listed stocks.

## 🏗️ Architecture & Technology Stack

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type-safe development
- **Build Tool**: Vite for fast development and optimized production builds  
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, accessible UI
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for efficient server state management and caching
- **UI Components**: shadcn/ui built on Radix UI primitives for accessibility

### Backend Architecture  
- **Runtime**: Node.js with Express.js following RESTful API design
- **Language**: TypeScript for full-stack type safety
- **Architecture Pattern**: Service-oriented architecture with dedicated services for stocks, AI, and news
- **Storage**: Dual-storage approach with in-memory storage for development and PostgreSQL for production
- **Session Management**: Express-session with PostgreSQL session store

### AI Integration
- **Primary AI**: Groq API with llama-3.3-70b-versatile model for intelligent chat responses
- **Capabilities**: Contextual stock market analysis, technical indicator explanations, and investment insights
- **Response Format**: Structured responses with action types and follow-up suggestions

### Database Schema
```typescript
// Core data structures
- Users: Authentication and profile management  
- WatchlistItems: User's tracked stocks
- StockAlerts: Price and technical indicator alerts
- ChatMessages: AI conversation history
```

## 📊 Data Sources & Authenticity

### Stock Market Data
**Current Implementation**: Mock/Simulated Data for Development
- **Stock Prices**: Simulated real-time pricing for major Indian stocks (RELIANCE, TCS, INFY, etc.)
- **Historical Data**: Generated historical price data with realistic patterns
- **Technical Indicators**: Calculated using actual formulas (RSI, MACD, Bollinger Bands, SMA, EMA)
- **Market Indices**: Simulated NIFTY 50 and SENSEX data

### Production Data Sources (Recommended)
- **Primary**: NSE/BSE official APIs for authentic Indian stock data
- **Alternative**: Yahoo Finance, Alpha Vantage, or Finnhub APIs
- **News**: NewsAPI.org, Economic Times, Business Standard RSS feeds
- **Government Sources**: SEBI and RBI for regulatory information

### ⚠️ Data Disclaimer
**Important**: The current version uses simulated data for demonstration purposes. For production use, integrate with authorized financial data providers and ensure compliance with exchange regulations.

## 🔄 Application Workflow

### 1. User Interface Flow
```
Dashboard Load → Stock Selection → Data Visualization → Technical Analysis → AI Consultation
```

### 2. Data Processing Pipeline
```
Stock Symbol Input → API Data Fetch → Technical Calculation → Chart Rendering → UI Update
```

### 3. AI Chatbot Workflow  
```
User Query → Context Processing → Groq API Call → Response Formatting → UI Display
```

### 4. Real-time Updates
```
Market Open Check → Periodic Data Refresh → WebSocket Updates → UI Refresh
```

## 🎮 Core Features

### 📈 Stock Analysis Dashboard
- **Real-time Stock Quotes**: Live price updates with change indicators
- **Interactive Charts**: Bar chart visualization with 20-day historical data
- **Technical Indicators**: RSI, MACD, Bollinger Bands calculations
- **Multiple Timeframes**: 1D, 5D, 1M, 6M, 1Y analysis periods

### 🤖 AI-Powered Chatbot
- **Natural Language Queries**: Ask about any NSE/BSE stock in plain English
- **Technical Analysis**: Get explanations of indicators and market patterns  
- **Market Insights**: AI-driven predictions and trend analysis
- **Contextual Responses**: Understands Indian market terminology and nuances

### 👀 Watchlist Management
- **Personal Watchlist**: Track favorite stocks with real-time updates
- **Quick Stock Switching**: Easy navigation between watched stocks
- **Portfolio Overview**: Monitor multiple stocks simultaneously

### 📰 News & Market Information
- **Market Status**: Live market open/close indicators
- **Financial News**: Curated news from trusted Indian financial sources
- **Sentiment Analysis**: News sentiment impact on stock performance

### 🔔 Smart Alerts System
- **Price Alerts**: Get notified when stocks hit target prices
- **Technical Alerts**: RSI, MACD, and other indicator-based alerts
- **Market Event Notifications**: Important market announcements

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL database (for production)
- Groq API key for AI functionality

### Installation
1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd stockguru-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Add to your environment
   GROQ_API_KEY=your_groq_api_key_here
   DATABASE_URL=your_postgresql_connection_string
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access Application**
   - Frontend: http://localhost:5000
   - Backend API: http://localhost:5000/api

### Development vs Production
- **Development**: Uses in-memory storage with simulated data
- **Production**: Requires PostgreSQL database and real financial data APIs

## 🔧 Configuration

### Database Setup (Production)
```bash
# Install PostgreSQL and create database
npm run db:migrate  # Run Drizzle migrations
npm run db:seed     # Seed initial data
```

### API Keys Required
- **Groq API**: For AI chatbot functionality
- **Stock Data API**: Yahoo Finance, Alpha Vantage, or similar
- **News API**: For financial news integration

## 📱 User Interface

### Responsive Design
- **Desktop**: Full dashboard with sidebar navigation
- **Tablet**: Collapsible sidebar for better space utilization  
- **Mobile**: Touch-optimized interface with bottom navigation

### Dark Theme
- **Modern Dark UI**: Easy on the eyes for long trading sessions
- **Color-coded Indicators**: Green for positive, red for negative changes
- **High Contrast**: Accessible design for all users

## 🔐 Security & Compliance

### Data Security
- **Session Management**: Secure cookie-based authentication
- **Password Hashing**: bcrypt for user password security
- **API Security**: Rate limiting and input validation

### Financial Compliance
- **Disclaimer**: Educational purpose only, not investment advice
- **Data Accuracy**: Real-time data subject to exchange delays
- **Risk Disclosure**: Users should consult financial advisors

## 📈 Technical Indicators Explained

### Implemented Indicators
- **RSI (Relative Strength Index)**: Momentum oscillator (14-period)
- **MACD**: Moving Average Convergence Divergence trend indicator
- **Bollinger Bands**: Volatility bands around moving average
- **SMA/EMA**: Simple and Exponential Moving Averages

### Calculation Methods
All indicators use authentic financial formulas with configurable periods and are calculated server-side for consistency.

## 🚀 Deployment

### Replit Deployment
The application is optimized for Replit deployment with:
- **Automatic SSL**: HTTPS by default
- **Custom Domains**: Support for branded URLs
- **Health Checks**: Built-in monitoring
- **Auto-scaling**: Handle traffic spikes

### Production Checklist
- [ ] Configure real financial data APIs
- [ ] Set up PostgreSQL database
- [ ] Enable SSL certificates
- [ ] Configure environment variables
- [ ] Set up monitoring and logging
- [ ] Implement backup strategies

## 🤝 Contributing

### Development Guidelines
- Follow TypeScript strict mode
- Use ESLint and Prettier for code formatting
- Write unit tests for new features
- Document API changes
- Follow semantic versioning

### Feature Requests
Submit issues for:
- New technical indicators
- Additional stock exchanges
- UI/UX improvements
- Performance optimizations

## 📄 License & Legal

### Usage Terms
- **Educational Use**: Free for learning and personal analysis
- **Commercial Use**: Contact for licensing agreements
- **Data Usage**: Subject to financial data provider terms
- **AI Usage**: Powered by Groq API with usage limits

### Disclaimer
This application is for educational and informational purposes only. It does not constitute investment advice. Users should consult qualified financial advisors before making investment decisions.

---

## 📞 Support & Contact

For technical support, feature requests, or partnership inquiries, please create an issue in the repository or contact the development team.

**Version**: 1.0.0  
**Last Updated**: August 2025  
**Maintained by**: StockGuru Development Team

---

*Empowering Indian investors with AI-driven stock market insights* 🚀📈