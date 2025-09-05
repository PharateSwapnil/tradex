import OpenAI from "openai";
import Groq from "groq-sdk";

// Initialize both OpenAI and Groq clients
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export interface ChatResponse {
  response: string;
  suggestions?: string[];
  stockData?: any;
  actionType?: 'stock_query' | 'technical_analysis' | 'market_insight' | 'general';
}

export interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
}

export interface StockInsight {
  symbol: string;
  prediction: {
    direction: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
    targetPrice?: number;
    timeframe: string;
  };
  reasoning: string;
  riskLevel: 'low' | 'medium' | 'high';
}

class AIService {
  async processChatMessage(message: string, userId?: string): Promise<ChatResponse> {
    try {
      const systemPrompt = `You are an expert Indian stock market AI assistant named StockGuru. You specialize in:
      - Indian stock market analysis (NSE, BSE)
      - Technical analysis and indicators
      - Market trends and predictions
      - Stock recommendations and insights
      
      Respond in a helpful, professional manner. If asked about specific stocks, include relevant technical details.
      When appropriate, suggest follow-up questions or actions.
      
      For stock-related queries, format your response to include actionType as 'stock_query' and provide relevant data.
      Keep responses concise but informative.
      
      Always respond in JSON format with the following structure:
      {
        "response": "your answer to the user's question",
        "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
        "actionType": "stock_query|general|technical_analysis"
      }`;

      // Try Groq first (faster and more reliable), fallback to OpenAI
      let response;
      try {
        response = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          response_format: { type: "json_object" }
        });
      } catch (groqError: any) {
        console.log('Groq failed, trying OpenAI:', groqError?.message || 'Unknown error');
        response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          response_format: { type: "json_object" }
        });
      }

      const content = response.choices[0].message.content || '';
      let aiResponse;
      
      try {
        aiResponse = JSON.parse(content);
      } catch {
        // Fallback for non-JSON responses
        aiResponse = {
          response: content,
          suggestions: [
            "Check NIFTY trends",
            "Analyze TCS fundamentals", 
            "Show technical indicators for RELIANCE"
          ]
        };
      }
      
      return {
        response: aiResponse.response || "I'm here to help you with Indian stock market queries.",
        suggestions: aiResponse.suggestions || [
          "Check NIFTY trends",
          "Analyze TCS fundamentals", 
          "Show technical indicators for RELIANCE"
        ],
        actionType: this.determineActionType(message)
      };
    } catch (error) {
      console.error('Error processing chat message:', error);
      
      // Enhanced fallback responses based on message content
      return this.getFallbackResponse(message);
    }
  }

  private getFallbackResponse(message: string): ChatResponse {
    const lowerMessage = message.toLowerCase();
    const actionType = this.determineActionType(message);
    
    // Extract stock symbol properly - be more specific with detection
    const stockMatches = message.match(/\b[A-Z]{2,10}\b/g) || [];
    const commonStocks = ['reliance', 'tcs', 'infosys', 'infy', 'hdfc', 'icici', 'sbi', 'wipro', 'bharti', 'itc', 'adani'];
    const stockNameMatches = commonStocks.filter(stock => lowerMessage.includes(stock));
    
    // Also check for index names but only if explicitly mentioned
    const indexNames = ['nifty', 'sensex', 'banknifty', 'niftybank'];
    const indexMatches = indexNames.filter(index => lowerMessage.includes(index));
    
    let detectedStock = null;
    
    // Priority: Direct symbol match > stock name match > index match
    if (stockMatches.length > 0) {
      detectedStock = stockMatches[0];
    } else if (stockNameMatches.length > 0) {
      // Map common names to symbols
      const stockMappings: { [key: string]: string } = {
        'reliance': 'RELIANCE',
        'tcs': 'TCS',
        'infosys': 'INFY',
        'infy': 'INFY',
        'hdfc': 'HDFCBANK',
        'icici': 'ICICIBANK',
        'sbi': 'SBIN',
        'adani': 'ADANIPORTS'
      };
      detectedStock = stockMappings[stockNameMatches[0]] || stockNameMatches[0].toUpperCase();
    } else if (indexMatches.length > 0) {
      const indexMappings: { [key: string]: string } = {
        'nifty': 'NIFTY',
        'sensex': 'SENSEX',
        'banknifty': 'NIFTYBANK',
        'niftybank': 'NIFTYBANK'
      };
      detectedStock = indexMappings[indexMatches[0]] || indexMatches[0].toUpperCase();
    }
    
    // Stock-specific responses
    if (actionType === 'stock_query' && detectedStock) {
      if (lowerMessage.includes('price') || lowerMessage.includes('current') || lowerMessage.includes('quote')) {
        return {
          response: `I can see you're asking about ${detectedStock}'s current price. The live data is displayed in the stock information section above. While I'm experiencing high API demand, you can view the real-time price, change percentage, and other key metrics in the main dashboard. The data refreshes every 30 seconds automatically.`,
          suggestions: [
            `View ${detectedStock} detailed analysis`,
            `Check ${detectedStock} technical indicators`,
            `Get ${detectedStock} market news`
          ],
          actionType: 'stock_query'
        };
      }
      
      return {
        response: `I'm here to help with ${detectedStock} analysis! While experiencing high API demand, you can find comprehensive live data above including current price, technical indicators (RSI, MACD, SMA), and recent news. The dashboard updates automatically with real-time information.`,
        suggestions: [
          `View ${detectedStock} price trends`,
          `Analyze ${detectedStock} technical signals`,
          `Check latest ${detectedStock} news`
        ],
        actionType: 'stock_query'
      };
    }
    
    // Technical analysis responses
    if (actionType === 'technical_analysis') {
      return {
        response: "I can help explain technical indicators! Check the technical analysis section above for RSI, MACD, and moving averages. These indicators help identify trends, momentum, and potential entry/exit points.",
        suggestions: [
          "Explain RSI indicator meaning",
          "How to read MACD signals",
          "Moving averages strategy"
        ],
        actionType: 'technical_analysis'
      };
    }
    
    // Market insights
    if (actionType === 'market_insight') {
      return {
        response: "For current market trends and insights, I recommend checking the latest news and technical analysis sections. The Indian markets are influenced by global cues, sectoral performance, and economic indicators.",
        suggestions: [
          "Check NIFTY 50 performance",
          "Analyze sector rotation trends",
          "Review market sentiment indicators"
        ],
        actionType: 'market_insight'
      };
    }
    
    // General responses when no specific stock detected
    if (lowerMessage.includes('price') || lowerMessage.includes('current') || lowerMessage.includes('quote')) {
      return {
        response: "I'm currently experiencing high API demand. To check current prices, please use the search box above to select a specific stock or index. The dashboard displays real-time data including prices, technical indicators, and news.",
        suggestions: [
          "Search for a specific stock (e.g., RELIANCE, TCS)",
          "Check NIFTY index performance",
          "View technical analysis section"
        ],
        actionType: 'general'
      };
    }

    return {
      response: "I'm your StockGuru AI assistant! I can help with Indian stock analysis, technical indicators, market trends, and investment insights. While experiencing high API demand, you can explore real-time data using the search and dashboard above.",
      suggestions: [
        "Search for a specific stock to analyze",
        "View technical indicators in the dashboard", 
        "Check market news and trends"
      ],
      actionType: 'general'
    };
  }

  async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
    try {
      // Try Groq first for faster sentiment analysis
      let response;
      try {
        response = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are a financial sentiment analysis expert. Analyze the sentiment of financial news or text and provide sentiment classification, score (0-100), and confidence level (0-1). Respond with JSON in this exact format: { 'sentiment': 'positive'|'negative'|'neutral', 'score': number, 'confidence': number }"
            },
            { role: "user", content: text }
          ],
          response_format: { type: "json_object" },
        });
      } catch (groqError: any) {
        response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a financial sentiment analysis expert. Analyze the sentiment of financial news or text and provide sentiment classification, score (0-100), and confidence level (0-1). Respond with JSON in this exact format: { 'sentiment': 'positive'|'negative'|'neutral', 'score': number, 'confidence': number }"
            },
            { role: "user", content: text }
          ],
          response_format: { type: "json_object" },
        });
      }

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        sentiment: result.sentiment || 'neutral',
        score: Math.max(0, Math.min(100, result.score || 50)),
        confidence: Math.max(0, Math.min(1, result.confidence || 0.5))
      };
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return {
        sentiment: 'neutral',
        score: 50,
        confidence: 0.5
      };
    }
  }

  async generateStockInsight(symbol: string, technicalData: any, newsData?: any[]): Promise<StockInsight> {
    try {
      const prompt = `Analyze the stock ${symbol} based on the following data:
      
      Technical Indicators:
      - RSI: ${technicalData.rsi}
      - MACD: ${technicalData.macd}
      - SMA(20): ${technicalData.sma20}
      - Current Price: ${technicalData.currentPrice}
      
      ${newsData ? `Recent News Sentiment: ${newsData.length} articles analyzed` : ''}
      
      Provide a stock insight with prediction, reasoning, and risk assessment. Format response as JSON:
      {
        "prediction": {
          "direction": "bullish|bearish|neutral",
          "confidence": number (0-100),
          "targetPrice": number,
          "timeframe": "1 week|1 month|3 months"
        },
        "reasoning": "explanation",
        "riskLevel": "low|medium|high"
      }`;

      // Try Groq first for faster stock insights
      let response;
      try {
        response = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are an expert stock analyst. Provide objective, data-driven insights based on technical and fundamental analysis."
            },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" },
        });
      } catch (groqError: any) {
        response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert stock analyst. Provide objective, data-driven insights based on technical and fundamental analysis."
            },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" },
        });
      }

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        symbol: symbol.toUpperCase(),
        prediction: {
          direction: result.prediction?.direction || 'neutral',
          confidence: result.prediction?.confidence || 50,
          targetPrice: result.prediction?.targetPrice,
          timeframe: result.prediction?.timeframe || '1 month'
        },
        reasoning: result.reasoning || 'Analysis based on current technical indicators.',
        riskLevel: result.riskLevel || 'medium'
      };
    } catch (error) {
      console.error('Error generating stock insight:', error);
      return {
        symbol: symbol.toUpperCase(),
        prediction: {
          direction: 'neutral',
          confidence: 50,
          timeframe: '1 month'
        },
        reasoning: 'Unable to generate insight at this time.',
        riskLevel: 'medium'
      };
    }
  }

  private determineActionType(message: string): 'stock_query' | 'technical_analysis' | 'market_insight' | 'general' {
    const stockPattern = /\b[A-Z]{2,10}\b/;
    const technicalTerms = ['rsi', 'macd', 'sma', 'ema', 'bollinger', 'technical', 'chart', 'indicator'];
    const marketTerms = ['nifty', 'sensex', 'market', 'trend', 'prediction', 'economy', 'sector'];
    const stockTerms = ['price', 'stock', 'share', 'company', 'reliance', 'tcs', 'infosys', 'hdfc', 'icici', 'sbi', 'adani'];
    
    const lowerMessage = message.toLowerCase();
    
    // Check for specific stock symbols or company names first
    if (stockPattern.test(message) || stockTerms.some(term => lowerMessage.includes(term))) {
      return 'stock_query';
    }
    
    if (technicalTerms.some(term => lowerMessage.includes(term))) {
      return 'technical_analysis';
    }
    
    if (marketTerms.some(term => lowerMessage.includes(term))) {
      return 'market_insight';
    }
    
    return 'general';
  }
}

export const aiService = new AIService();
