import express, { type Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";
import { stockService } from "./services/stockService";
import { aiService } from "./services/aiService";
import { newsService } from "./services/newsService";
import { 
  insertWatchlistItemSchema, 
  insertStockAlertSchema, 
  insertChatMessageSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Static file serving for chatbot widget
  app.use('/static', express.static(path.join(import.meta.dirname, '../client/public')));
  
  // Chatbot widget script route
  app.get('/chatbot-widget.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(import.meta.dirname, '../client/public/chatbot-widget.js'));
  });
  
  // Chatbot iframe page route
  app.get("/chatbot", (req, res) => {
    const { theme = 'light', stock = 'RELIANCE', userId = 'guest' } = req.query;
    const isLight = theme === 'light';
    const bgColor = isLight ? '#ffffff' : '#0f172a';
    const textColor = isLight ? '#000000' : '#ffffff';
    const paramsBg = isLight ? '#f8fafc' : '#1e293b';
    const border = isLight ? '#e2e8f0' : '#475569';
    const spinnerBorder = isLight ? '#e2e8f0' : '#475569';
    
    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html>
<head>
    <title>StockGuru AI Chatbot</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
            background: ${bgColor};
            color: ${textColor};
            overflow: hidden;
        }
        .chatbot-container {
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            padding: 20px;
        }
        .message {
            text-align: center;
            margin-bottom: 20px;
        }
        .params {
            background: ${paramsBg};
            padding: 15px;
            border-radius: 8px;
            border: 1px solid ${border};
            font-family: monospace;
            font-size: 14px;
        }
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid ${spinnerBorder};
            border-top: 4px solid #3B82F6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .redirect-link {
            color: #3B82F6;
            text-decoration: none;
            font-weight: 500;
            margin-top: 15px;
            display: inline-block;
        }
        .redirect-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="chatbot-container">
        <div class="spinner"></div>
        <div class="message">
            <h2>StockGuru AI Chatbot</h2>
            <p>Iframe integration successful!</p>
        </div>
        <div class="params">
            <strong>Configuration:</strong><br>
            Theme: ${theme}<br>
            Default Stock: ${stock}<br>
            User ID: ${userId}
        </div>
        <a href="${req.protocol}://${req.get('host')}" class="redirect-link" target="_parent">
            Open Full StockGuru App
        </a>
    </div>
    <script>
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const themeParam = urlParams.get('theme') || 'light';
        const stockParam = urlParams.get('stock') || 'RELIANCE';
        const userIdParam = urlParams.get('userId') || 'guest';
        
        // Post message to parent for communication
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'chatbotLoaded',
                theme: themeParam,
                stock: stockParam,
                userId: userIdParam,
                timestamp: Date.now()
            }, '*');
        }
        
        // Simulate loading
        setTimeout(() => {
            const spinner = document.querySelector('.spinner');
            const message = document.querySelector('.message p');
            if (spinner) spinner.style.display = 'none';
            if (message) message.textContent = 'Ready for integration!';
        }, 2000);
    </script>
</body>
</html>`);
  });

  // Stock data routes
  app.get("/api/stocks/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const quote = await stockService.getStockQuote(symbol);
      res.json(quote);
    } catch (error) {
      res.status(404).json({ 
        message: error instanceof Error ? error.message : "Stock not found" 
      });
    }
  });

  app.get("/api/stocks/:symbol/historical", async (req, res) => {
    try {
      const { symbol } = req.params;
      const { period = '1mo' } = req.query;
      const data = await stockService.getHistoricalData(symbol, period as string);
      res.json(data);
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch historical data" 
      });
    }
  });

  app.get("/api/stocks/:symbol/technical", async (req, res) => {
    try {
      const { symbol } = req.params;
      const indicators = await stockService.getTechnicalIndicators(symbol);
      res.json(indicators);
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to calculate technical indicators" 
      });
    }
  });

  app.get("/api/market/indices", async (req, res) => {
    try {
      const indices = await stockService.getMarketIndices();
      res.json(indices);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch market indices" 
      });
    }
  });

  app.get("/api/stocks/search/:query", async (req, res) => {
    try {
      const { query } = req.params;
      const results = await stockService.searchStocks(query);
      res.json(results);
    } catch (error) {
      res.status(400).json({ 
        message: "Search failed" 
      });
    }
  });

  // Watchlist routes
  app.get("/api/watchlist/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const watchlist = await storage.getUserWatchlist(userId);
      
      // Enhance with current stock data
      const enhancedWatchlist = await Promise.allSettled(
        watchlist.map(async (item) => {
          try {
            const quote = await stockService.getStockQuote(item.symbol);
            return { ...item, quote };
          } catch (error) {
            return item;
          }
        })
      );

      const results = enhancedWatchlist
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value);

      res.json(results);
    } catch (error) {
      res.status(400).json({ 
        message: "Failed to fetch watchlist" 
      });
    }
  });

  app.post("/api/watchlist", async (req, res) => {
    try {
      const validatedData = insertWatchlistItemSchema.parse(req.body);
      const item = await storage.addToWatchlist(validatedData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to add to watchlist" 
      });
    }
  });

  app.delete("/api/watchlist/:userId/:symbol", async (req, res) => {
    try {
      const { userId, symbol } = req.params;
      const success = await storage.removeFromWatchlist(userId, symbol);
      
      if (success) {
        res.json({ message: "Removed from watchlist" });
      } else {
        res.status(404).json({ message: "Item not found in watchlist" });
      }
    } catch (error) {
      res.status(400).json({ 
        message: "Failed to remove from watchlist" 
      });
    }
  });

  // News routes
  app.get("/api/news", async (req, res) => {
    try {
      const { symbols } = req.query;
      const symbolsArray = typeof symbols === 'string' ? symbols.split(',') : undefined;
      const news = await newsService.getMarketNews(symbolsArray);
      res.json(news);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch news" 
      });
    }
  });

  app.get("/api/news/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const news = await newsService.getStockSpecificNews(symbol);
      res.json(news);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch stock news" 
      });
    }
  });

  app.get("/api/market/sentiment", async (req, res) => {
    try {
      const sentiment = await newsService.getMarketSentimentScore();
      res.json(sentiment);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch market sentiment" 
      });
    }
  });

  // AI Chat routes (using intelligent workflow)

  app.get("/api/chat/history/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit } = req.query;
      const history = await storage.getUserChatHistory(
        userId, 
        limit ? parseInt(limit as string) : undefined
      );
      res.json(history);
    } catch (error) {
      res.status(400).json({ 
        message: "Failed to fetch chat history" 
      });
    }
  });

  // Clear chat history route
  app.delete("/api/chat/history/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.clearUserChatHistory(userId);
      res.json({ message: "Chat history cleared successfully" });
    } catch (error) {
      res.status(400).json({ 
        message: "Failed to clear chat history" 
      });
    }
  });

  // AI Insights route
  app.get("/api/insights/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      
      // Get technical data
      const [quote, technicalData, news] = await Promise.allSettled([
        stockService.getStockQuote(symbol),
        stockService.getTechnicalIndicators(symbol),
        newsService.getStockSpecificNews(symbol)
      ]);

      const quoteData = quote.status === 'fulfilled' ? quote.value : null;
      const technicalResult = technicalData.status === 'fulfilled' ? technicalData.value : null;
      const newsData = news.status === 'fulfilled' ? news.value : [];

      if (!technicalResult || !quoteData) {
        return res.status(400).json({ message: "Insufficient data for analysis" });
      }

      const insight = await aiService.generateStockInsight(
        symbol,
        { ...technicalResult, currentPrice: quoteData.price },
        newsData
      );

      res.json(insight);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to generate stock insight" 
      });
    }
  });

  // Alerts routes
  app.get("/api/alerts/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const alerts = await storage.getUserAlerts(userId);
      res.json(alerts);
    } catch (error) {
      res.status(400).json({ 
        message: "Failed to fetch alerts" 
      });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const validatedData = insertStockAlertSchema.parse(req.body);
      const alert = await storage.createAlert(validatedData);
      res.status(201).json(alert);
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to create alert" 
      });
    }
  });

  // Enhanced chat route with web search integration
  app.post("/api/chat", async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse(req.body);
      const userMessage = validatedData.message;
      
      // Import and use intelligent chat service
      const { IntelligentChatService } = await import('./services/intelligentChatService');
      const intelligentChat = new IntelligentChatService();

      // Process query using intelligent workflow with 5-step analysis
      console.log(`\n🚀 Processing query: "${userMessage}"`);
      const chatResult = await intelligentChat.processQuery(userMessage);
      
      console.log('📊 Execution Steps:');
      chatResult.executionSteps.forEach((step, index) => {
        console.log(`  ${index + 1}. ${step}`);
      });
      console.log(`🎯 Query Type: ${chatResult.classification.type} (${Math.round(chatResult.classification.confidence * 100)}% confidence)`);
      console.log(`📈 Data Used: ${chatResult.dataUsed ? Object.keys(chatResult.dataUsed).join(', ') : 'None'}`);

      // Store the message and response
      const chatMessage = await storage.saveChatMessage({
        userId: validatedData.userId,
        message: userMessage,
        response: chatResult.response
      });

      // Return response with classification metadata
      res.json({
        ...chatMessage,
        metadata: {
          classification: chatResult.classification,
          executionSteps: chatResult.executionSteps,
          dataSymbols: chatResult.dataUsed ? Object.keys(chatResult.dataUsed) : [],
          workflow: 'intelligent_analysis'
        }
      });
    } catch (error) {
      console.error('❌ Intelligent chat error:', error);
      res.status(500).json({ error: 'Failed to process intelligent chat message' });
    }
  });

  app.get("/api/chat/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const history = await storage.getUserChatHistory(userId, limit);
      res.json(history);
    } catch (error) {
      res.status(400).json({ 
        message: "Failed to fetch chat history" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
