# StockGuru AI Chatbot Integration Guide

## Overview
This comprehensive guide provides detailed information on how to integrate the StockGuru AI chatbot into external websites and applications. Whether you're running the project locally or deploying it to production, this guide covers all integration methods, requirements, and best practices.

## Local Development Setup

### Prerequisites for Local Development
Before integrating the chatbot, ensure your local environment is properly configured:

1. **Node.js Environment**
   - Node.js v18+ installed
   - npm or yarn package manager
   - Port 5000 available (default server port)

2. **Required Environment Variables**
   ```bash
   # Create a .env file in your project root
   OPENAI_API_KEY=your_openai_api_key_here
   NODE_ENV=development
   PORT=5000
   DATABASE_URL=your_postgresql_url (optional for development)
   ```

3. **Start the Local Server**
   ```bash
   # Clone and navigate to project directory
   npm install
   npm run dev
   ```
   
   Your server will be available at: `http://localhost:5000`

### Local Integration URLs
When running locally, use these URLs for integration:
- **Widget Script**: `http://localhost:5000/chatbot-widget.js`
- **Iframe URL**: `http://localhost:5000/chatbot`
- **API Base**: `http://localhost:5000/api`

## Integration Methods

### 1. Iframe Embedding (Recommended)
The simplest way to integrate the chatbot is through an iframe.

#### Basic Implementation

**For Local Development:**
```html
<iframe 
  src="http://localhost:5000/chatbot?theme=dark&stock=RELIANCE&userId=demo-user" 
  width="400" 
  height="600" 
  frameborder="0" 
  title="StockGuru AI Chatbot">
</iframe>
```

**For Production Deployment:**
```html
<iframe 
  src="https://your-domain.replit.app/chatbot?theme=dark&stock=RELIANCE&userId=demo-user" 
  width="400" 
  height="600" 
  frameborder="0" 
  title="StockGuru AI Chatbot">
</iframe>
```

#### Responsive Implementation
```html
<div style="position: relative; width: 100%; max-width: 400px; height: 600px;">
  <iframe 
    src="https://your-domain.replit.app/chatbot" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);"
    title="StockGuru AI Chatbot">
  </iframe>
</div>
```

### 2. JavaScript Widget Integration
For more control and customization, use the JavaScript widget.

#### Basic Widget Code

**For Local Development:**
```html
<!-- Add this to your HTML head -->
<script src="http://localhost:5000/chatbot-widget.js"></script>

<!-- Add this where you want the chatbot to appear -->
<div id="stockguru-chatbot"></div>

<script>
  window.StockGuruChatbot.init({
    containerId: 'stockguru-chatbot',
    theme: 'dark', // or 'light'
    width: '400px',
    height: '600px',
    defaultStock: 'RELIANCE', // Optional: default stock symbol
    userId: 'your-unique-user-id' // Optional: for user identification
  });
</script>
```

**For Production Deployment:**
```html
<!-- Add this to your HTML head -->
<script src="https://your-domain.replit.app/chatbot-widget.js"></script>

<!-- Add this where you want the chatbot to appear -->
<div id="stockguru-chatbot"></div>

<script>
  window.StockGuruChatbot.init({
    containerId: 'stockguru-chatbot',
    theme: 'dark', // or 'light'
    width: '400px',
    height: '600px',
    defaultStock: 'RELIANCE', // Optional: default stock symbol
    userId: 'your-unique-user-id' // Optional: for user identification
  });
</script>
```

#### Floating Button Widget
```html
<script src="https://your-domain.replit.app/chatbot-widget.js"></script>

<script>
  window.StockGuruChatbot.initFloating({
    position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
    theme: 'dark',
    buttonColor: '#3B82F6',
    defaultStock: 'NIFTY',
    userId: 'your-unique-user-id'
  });
</script>
```

### 3. API Integration
For custom implementations, use the REST API endpoints.

#### Base URL

**For Local Development:**
```
http://localhost:5000/api
```

**For Production Deployment:**
```
https://your-domain.replit.app/api
```

#### Authentication
Include user identification in requests:
```javascript
headers: {
  'Content-Type': 'application/json',
  'X-User-ID': 'your-unique-user-id'
}
```

#### Send Message
```javascript
POST /api/chat
{
  "message": "What's the outlook for RELIANCE?",
  "userId": "your-unique-user-id"
}

Response:
{
  "id": "msg-123",
  "response": "Based on current analysis...",
  "suggestions": ["Tell me about NIFTY", "Show me technical indicators"],
  "timestamp": "2025-08-19T07:53:00Z"
}
```

#### Get Chat History
```javascript
GET /api/chat/history?userId=your-unique-user-id

Response:
{
  "messages": [
    {
      "id": "msg-123",
      "message": "What's the outlook for RELIANCE?",
      "response": "Based on current analysis...",
      "timestamp": "2025-08-19T07:53:00Z"
    }
  ]
}
```

#### Get Stock Data (for context)
```javascript
GET /api/stocks/{symbol}
GET /api/stocks/{symbol}/technical
GET /api/insights/{symbol}
GET /api/news
```

## Configuration Options

### Theme Customization
```javascript
{
  theme: 'dark', // 'dark' or 'light'
  primaryColor: '#3B82F6',
  backgroundColor: '#1E293B',
  textColor: '#F8FAFC',
  borderRadius: '12px',
  fontFamily: 'Inter, sans-serif'
}
```

### Stock Symbols
Supported Indian stock symbols include:
- **Nifty 50**: RELIANCE, TCS, INFY, HDFC, ICICIBANK, etc.
- **Market Indices**: NIFTY, SENSEX, BANKNIFTY
- **Popular Stocks**: ADANIGREEN, BAJFINANCE, BHARTIARTL, etc.

### User Context
```javascript
{
  userId: 'unique-identifier',
  userType: 'premium', // 'free', 'premium', 'enterprise'
  defaultStock: 'RELIANCE',
  preferredLanguage: 'en',
  timezone: 'Asia/Kolkata'
}
```

## Advanced Features

### Real-time Updates
Enable WebSocket connections for real-time market data:
```javascript
const ws = new WebSocket('wss://your-domain.replit.app/ws');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'stock_update') {
    // Handle real-time stock updates
  }
};
```

### Custom Event Handlers
```javascript
window.StockGuruChatbot.init({
  containerId: 'stockguru-chatbot',
  onMessageSent: (message) => {
    console.log('User sent:', message);
  },
  onResponseReceived: (response) => {
    console.log('Bot responded:', response);
  },
  onStockSelected: (symbol) => {
    console.log('Stock selected:', symbol);
    // Update your page with stock data
  }
});
```

## Security Considerations

### API Rate Limiting
- **Free Tier**: 100 requests/hour per user
- **Premium Tier**: 1000 requests/hour per user
- **Enterprise**: Custom limits

### CORS Settings
Configure allowed domains in your deployment:
```javascript
// In your server configuration
cors: {
  origin: [
    'https://your-website.com',
    'https://www.your-website.com'
  ]
}
```

### Content Security Policy
Add these CSP headers if using iframe embedding:
```
frame-src https://your-domain.replit.app;
script-src https://your-domain.replit.app;
connect-src https://your-domain.replit.app wss://your-domain.replit.app;
```

## Example Implementations

### 1. Blog Website Integration
```html
<!DOCTYPE html>
<html>
<head>
  <title>Stock Market Blog</title>
</head>
<body>
  <article>
    <h1>Market Analysis Today</h1>
    <p>Today's market showed strong performance...</p>
    
    <!-- Chatbot Integration -->
    <div class="chatbot-section">
      <h3>Ask Our AI Expert</h3>
      <div id="stockguru-chatbot"></div>
    </div>
  </article>

  <script src="https://your-domain.replit.app/chatbot-widget.js"></script>
  <script>
    window.StockGuruChatbot.init({
      containerId: 'stockguru-chatbot',
      theme: 'light',
      defaultStock: 'NIFTY',
      width: '100%',
      height: '500px'
    });
  </script>
</body>
</html>
```

### 2. Trading Platform Integration
```html
<!-- Floating chatbot on trading platform -->
<script src="https://your-domain.replit.app/chatbot-widget.js"></script>
<script>
  window.StockGuruChatbot.initFloating({
    position: 'bottom-right',
    theme: 'dark',
    defaultStock: getCurrentlyViewedStock(), // Your platform's function
    userId: getUserId(), // Your platform's user ID
    onStockSelected: (symbol) => {
      // Navigate to stock page on your platform
      window.location.href = `/stock/${symbol}`;
    }
  });
</script>
```

### 3. React Component Integration
```jsx
import React, { useEffect, useRef } from 'react';

const StockGuruChatbot = ({ userId, defaultStock }) => {
  const chatbotRef = useRef(null);

  useEffect(() => {
    if (window.StockGuruChatbot && chatbotRef.current) {
      window.StockGuruChatbot.init({
        containerId: chatbotRef.current.id,
        theme: 'dark',
        defaultStock,
        userId,
        width: '100%',
        height: '600px'
      });
    }
  }, [userId, defaultStock]);

  return (
    <div>
      <div id="stockguru-chatbot-container" ref={chatbotRef} />
    </div>
  );
};

export default StockGuruChatbot;
```

## Customization Examples

### Custom Styling
```css
/* Override chatbot styles */
.stockguru-chatbot {
  border-radius: 16px !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
}

.stockguru-chatbot .message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}
```

### Responsive Design
```css
.chatbot-container {
  width: 100%;
  max-width: 400px;
  height: 600px;
}

@media (max-width: 768px) {
  .chatbot-container {
    height: 400px;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-width: none;
    z-index: 1000;
  }
}
```

## Files You Need to Modify for Integration

### Server-Side Files (Your StockGuru Project)

1. **server/routes.ts** - Already configured with:
   - `/chatbot-widget.js` - Serves the widget script
   - `/chatbot` - Serves the iframe page
   - `/static` - Serves static assets
   - All API endpoints for stock data and chat

2. **client/public/chatbot-widget.js** - Widget script (automatically created):
   - Contains all integration logic
   - Handles iframe creation and communication
   - Supports both embedded and floating modes

3. **Environment Configuration**:
   ```bash
   # Required environment variables
   OPENAI_API_KEY=sk-...your-openai-key
   NODE_ENV=development
   PORT=5000
   
   # Optional for production
   DATABASE_URL=postgresql://...
   CORS_ORIGINS=http://localhost:3000,https://your-client-site.com
   ```

### Client-Side Requirements (Client's Website)

1. **No file modifications needed** - Pure JavaScript integration
2. **CORS considerations** - Ensure your domain allows iframe embedding
3. **Content Security Policy** - Add appropriate CSP headers if needed

## Local Development Integration Steps

### Step 1: Start Your StockGuru Server
```bash
# In your StockGuru project directory
npm install
npm run dev

# Server starts at http://localhost:5000
# Widget available at: http://localhost:5000/chatbot-widget.js
# Iframe page at: http://localhost:5000/chatbot
```

### Step 2: Client Integration Options

#### Option A: Test with Simple HTML File
Create a test file on the client side:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test StockGuru Integration</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
    <h1>My Website</h1>
    <p>Some content here...</p>
    
    <!-- Method 1: Iframe Integration -->
    <div style="margin: 20px 0;">
        <h3>Iframe Integration:</h3>
        <iframe 
            src="http://localhost:5000/chatbot?theme=dark&stock=RELIANCE&userId=test-user"
            width="400" 
            height="600" 
            frameborder="0" 
            style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);"
            title="StockGuru AI Chatbot">
        </iframe>
    </div>
    
    <!-- Method 2: Widget Integration -->
    <div style="margin: 20px 0;">
        <h3>Widget Integration:</h3>
        <div id="stockguru-chatbot"></div>
    </div>
    
    <!-- Method 3: Floating Button -->
    <script src="http://localhost:5000/chatbot-widget.js"></script>
    <script>
        // Initialize embedded widget
        window.StockGuruChatbot.init({
            containerId: 'stockguru-chatbot',
            theme: 'dark',
            width: '400px',
            height: '600px',
            defaultStock: 'RELIANCE',
            userId: 'test-user-123'
        });
        
        // Initialize floating button
        window.StockGuruChatbot.initFloating({
            position: 'bottom-right',
            theme: 'dark',
            buttonColor: '#3B82F6',
            defaultStock: 'NIFTY',
            userId: 'test-user-123'
        });
    </script>
</body>
</html>
```

#### Option B: Direct API Integration
For custom implementations, use the REST API:

```javascript
// Example: Send message to chatbot
async function sendMessage(message, userId) {
    const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: message,
            userId: userId
        })
    });
    
    const data = await response.json();
    return data;
}

// Example: Get stock data
async function getStockData(symbol) {
    const response = await fetch(`http://localhost:5000/api/stocks/${symbol}`);
    const data = await response.json();
    return data;
}

// Usage
sendMessage("What's the outlook for RELIANCE?", "user-123")
    .then(response => console.log(response));

getStockData("RELIANCE")
    .then(data => console.log(data));
```

## Production Deployment Requirements

### Step 1: Deploy StockGuru to Production
1. **Deploy to Replit** (or any hosting platform):
   ```bash
   # Your StockGuru app will be available at:
   https://your-replit-app-name.replit.app
   ```

2. **Update Environment Variables**:
   ```bash
   OPENAI_API_KEY=your-production-openai-key
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=your-production-database
   CORS_ORIGINS=https://client-domain1.com,https://client-domain2.com
   ```

### Step 2: Update Client Integration URLs
Replace all `localhost:5000` references with your production URL:

```html
<!-- Production Widget Script -->
<script src="https://your-replit-app.replit.app/chatbot-widget.js"></script>

<!-- Production Iframe -->
<iframe src="https://your-replit-app.replit.app/chatbot?theme=dark&stock=RELIANCE&userId=user-123"></iframe>
```

### Step 3: Configure CORS and Security
Update `server/index.ts` if needed:

```javascript
// Add CORS configuration
app.use((req, res, next) => {
  const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
```

## Environment Variables Configuration

### Required Environment Variables
Set these in your Replit deployment or local `.env` file:
```bash
# Core Configuration
OPENAI_API_KEY=sk-...your-openai-key
NODE_ENV=development  # or 'production'
PORT=5000

# Database (Optional for development, uses in-memory storage)
DATABASE_URL=postgresql://username:password@host:5432/database

# Security & CORS
CORS_ORIGINS=http://localhost:3000,https://client-website.com
RATE_LIMIT_FREE=100
RATE_LIMIT_PREMIUM=1000

# API Keys for Enhanced Features (Optional)
TAVILY_API_KEY=your-tavily-key  # For enhanced news search
GROQ_API_KEY=your-groq-key     # Alternative AI provider
```

### Custom Domain Setup (Production)
1. Configure your custom domain in Replit
2. Update CORS settings to include your client domains
3. Update all integration URLs in client code
4. Test all endpoints with new domain

## Support and Troubleshooting

### Common Issues

1. **CORS Errors**
   - Add your domain to CORS_ORIGINS
   - Check Content Security Policy headers

2. **Rate Limiting**
   - Implement proper user identification
   - Cache responses when possible
   - Upgrade to premium for higher limits

3. **Mobile Responsiveness**
   - Use viewport meta tag
   - Implement responsive CSS
   - Test on various devices

### Testing Your Integration

#### Local Development Testing
```javascript
// Test API connectivity (Local)
fetch('http://localhost:5000/api/stocks/RELIANCE')
  .then(response => response.json())
  .then(data => console.log('API Status:', data))
  .catch(error => console.error('API Error:', error));

// Test chatbot widget loading
window.StockGuruChatbot.init({
  containerId: 'test-container',
  debug: true // Enable debug mode for detailed logs
});

// Test direct chat API
fetch('http://localhost:5000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Test message',
    userId: 'test-user'
  })
})
.then(response => response.json())
.then(data => console.log('Chat Response:', data));
```

#### Production Testing
```javascript
// Test API connectivity (Production)
fetch('https://your-domain.replit.app/api/stocks/RELIANCE')
  .then(response => response.json())
  .then(data => console.log('API Status:', data));

// Test chatbot functionality
window.StockGuruChatbot.init({
  containerId: 'test-container',
  debug: true
});
```

## Common Issues and Solutions

### 1. **Widget Script Not Loading**
```
Error: Failed to load widget script
```
**Solutions:**
- Ensure your StockGuru server is running on port 5000
- Check if `http://localhost:5000/chatbot-widget.js` is accessible
- Verify CORS settings allow your client domain
- Check browser console for detailed error messages

### 2. **Iframe Not Loading**
```
Error: Refused to display 'localhost:5000' in a frame
```
**Solutions:**
- Add X-Frame-Options header configuration:
```javascript
// In server/index.ts
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});
```

### 3. **API Calls Failing**
```
Error: CORS policy blocked the request
```
**Solutions:**
- Configure CORS in your server:
```javascript
// In server/index.ts
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
```

### 4. **OpenAI API Errors**
```
Error: You exceeded your current quota
```
**Solutions:**
- Set your OpenAI API key: `OPENAI_API_KEY=sk-your-key`
- Check your OpenAI account billing and usage
- Ensure API key has sufficient credits

### 5. **Environment Variables Not Loading**
**Solutions:**
- Create `.env` file in project root
- Ensure all required variables are set
- Restart the development server after adding variables

### 6. **Local Development Network Issues**
**Solutions:**
- Use `0.0.0.0:5000` instead of `localhost:5000` for external access
- Check firewall settings
- Ensure port 5000 is not blocked

## Advanced Configuration

### Custom Theme Integration
```javascript
// Custom theme configuration
window.StockGuruChatbot.init({
  containerId: 'chatbot',
  theme: 'custom',
  customStyles: {
    primaryColor: '#1e40af',
    backgroundColor: '#f8fafc',
    textColor: '#1e293b',
    borderRadius: '16px'
  }
});
```

### Multi-Language Support
```javascript
// Language configuration
window.StockGuruChatbot.init({
  containerId: 'chatbot',
  language: 'en', // 'en', 'hi' (future support)
  defaultStock: 'RELIANCE',
  localization: {
    welcomeMessage: 'Welcome to StockGuru AI!',
    placeholderText: 'Ask about stocks...'
  }
});
```

### Performance Optimization
```javascript
// Lazy loading configuration
window.StockGuruChatbot.init({
  containerId: 'chatbot',
  lazyLoad: true,
  preloadData: ['RELIANCE', 'NIFTY'], // Preload popular stocks
  cacheTimeout: 300000 // 5 minutes cache
});
```

## Pricing Tiers

### Free Tier
- 100 API calls/hour
- Basic chatbot features
- Community support

### Premium Tier ($19/month)
- 1000 API calls/hour
- Advanced analytics
- Custom branding
- Email support

### Enterprise (Custom)
- Unlimited API calls
- White-label solution
- Custom integrations
- Dedicated support

## Contact and Support

For integration support or custom requirements:
- Email: support@stockguru.ai
- Documentation: https://docs.stockguru.ai
- GitHub: https://github.com/stockguru/api-docs

---

**Note**: Replace `your-domain.replit.app` with your actual deployment URL. This integration guide assumes the chatbot backend is properly deployed and accessible.