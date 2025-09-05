import { QueryAnalyzer, QueryClassification } from './queryAnalyzer';
import { stockService } from './stockService';
import { newsService } from './newsService';
import { aiService } from './aiService';

export interface ChatResponse {
  response: string;
  classification: QueryClassification;
  dataUsed?: any;
  executionSteps: string[];
}

export class IntelligentChatService {
  private queryAnalyzer: QueryAnalyzer;

  constructor() {
    this.queryAnalyzer = new QueryAnalyzer();
  }

  async processQuery(query: string): Promise<ChatResponse> {
    const steps: string[] = [];
    steps.push('🔍 Analyzing query type and requirements...');

    // Step 1: Classify the query
    const classification = await this.queryAnalyzer.classifyQuery(query);
    steps.push(`📊 Classification: ${classification.type} (${Math.round(classification.confidence * 100)}% confidence)`);

    let contextData: any = {};
    let dataUsed: any = null;

    try {
      // Step 2: Execute based on classification
      switch (classification.type) {
        case 'MARKET_DATA':
          steps.push('📈 Fetching live market data...');
          dataUsed = await this.fetchMarketData(classification.stockSymbols || []);
          contextData = dataUsed;
          break;

        case 'MIXED':
          steps.push('📈 Fetching live data and preparing explanations...');
          dataUsed = await this.fetchMarketData(classification.stockSymbols || []);
          contextData = dataUsed;
          break;

        case 'GENERAL_EXPLANATION':
          steps.push('📚 Preparing educational response...');
          // No additional data needed
          break;
      }

      // Step 3: Generate intelligent response
      steps.push('🤖 Generating AI response with context...');
      const response = await this.generateContextualResponse(query, classification, contextData);

      return {
        response,
        classification,
        dataUsed,
        executionSteps: steps
      };

    } catch (error) {
      console.error('Error in intelligent chat processing:', error);
      steps.push('❌ API rate limit reached, providing data-based fallback response');
      
      // If we have context data but AI failed, provide a smart fallback
      if (contextData && Object.keys(contextData).length > 0) {
        const symbol = Object.keys(contextData)[0];
        const stockData = contextData[symbol];
        
        if (stockData && stockData.quote) {
          const quote = stockData.quote;
          const indicators = stockData.indicators;
          
          let fallbackResponse = `Here's the current data for ${symbol}:\n\n`;
          fallbackResponse += `💰 Current Price: ₹${quote.price.toFixed(2)}\n`;
          fallbackResponse += `📈 Change: ${quote.change >= 0 ? '+' : ''}${quote.change.toFixed(2)} (${quote.changePercent.toFixed(2)}%)\n`;
          fallbackResponse += `📊 Volume: ${quote.volume.toLocaleString()}\n`;
          
          if (indicators) {
            fallbackResponse += `\n🔍 Technical Analysis:\n`;
            fallbackResponse += `• RSI: ${indicators.rsi.toFixed(1)} ${indicators.rsi > 70 ? '(Overbought)' : indicators.rsi < 30 ? '(Oversold)' : '(Neutral)'}\n`;
            fallbackResponse += `• MACD: ${indicators.macd.toFixed(2)} ${indicators.macd > 0 ? '(Bullish)' : '(Bearish)'}\n`;
            fallbackResponse += `• SMA(20): ₹${indicators.sma20.toFixed(2)}\n`;
          }
          
          fallbackResponse += `\n📅 Data as of: ${new Date().toLocaleString()}\n`;
          fallbackResponse += `\nNote: AI analysis temporarily unavailable due to high demand, but live data is current.`;
          
          return {
            response: fallbackResponse,
            classification,
            dataUsed: contextData,
            executionSteps: steps
          };
        }
      }
      
      return {
        response: "I'm currently experiencing high API demand. Please check the live stock data displayed above in the dashboard - it includes current prices, technical indicators, and news updates that refresh automatically.",
        classification,
        dataUsed: contextData,
        executionSteps: steps
      };
    }
  }

  private async fetchMarketData(symbols: string[]): Promise<any> {
    const data: any = {};

    // If no symbols specified, try to extract from context or return empty
    if (symbols.length === 0) {
      console.log('⚠️ No stock symbols detected for market data fetch');
      return data;
    }

    console.log(`📊 Fetching market data for symbols: ${symbols.join(', ')}`);

    try {
      // Fetch stock data for each symbol
      for (const symbol of symbols) {
        try {
          const quote = await stockService.getStockQuote(symbol);
          const indicators = await stockService.getTechnicalIndicators(symbol);
          
          data[symbol] = {
            quote,
            indicators,
            timestamp: new Date().toISOString()
          };

          // For major indices, also get news
          if (['NIFTY', 'NIFTY50', 'SENSEX'].includes(symbol.toUpperCase())) {
            try {
              const news = await newsService.getMarketNews([symbol]);
              data[symbol].news = news.articles.slice(0, 3);
            } catch (newsError) {
              console.log(`News fetch failed for ${symbol}`);
            }
          }
        } catch (error) {
          console.error(`Failed to fetch data for ${symbol}:`, error);
          data[symbol] = { error: `Data unavailable for ${symbol}` };
        }
      }

      return data;
    } catch (error) {
      console.error('Error fetching market data:', error);
      throw error;
    }
  }

  private async generateContextualResponse(
    query: string, 
    classification: QueryClassification, 
    contextData: any
  ): Promise<string> {
    
    let systemPrompt = '';
    let contextInfo = '';

    // Build context based on classification
    switch (classification.type) {
      case 'MARKET_DATA':
        systemPrompt = `You are a financial data analyst. Provide clear, data-driven responses about stock market information. Use the live data provided to give accurate current information. Include numbers, percentages, and key insights.`;
        break;

      case 'GENERAL_EXPLANATION':
        systemPrompt = `You are a financial educator. Explain financial concepts clearly and simply. Use examples and analogies to make complex topics easy to understand. No live data is needed.`;
        break;

      case 'MIXED':
        systemPrompt = `You are a comprehensive financial assistant. First explain the concept/definition clearly, then provide current live data and analysis. Combine education with real-time insights.`;
        break;
    }

    // Format context data
    if (classification.needsLiveData && contextData) {
      contextInfo = '\n\nCurrent Market Data:\n';
      
      for (const [symbol, data] of Object.entries(contextData)) {
        if (data && typeof data === 'object' && 'quote' in data) {
          const stockData = data as any;
          contextInfo += `\n${symbol}:`;
          contextInfo += `\n- Price: ₹${stockData.quote.price.toFixed(2)}`;
          contextInfo += `\n- Change: ${stockData.quote.change >= 0 ? '+' : ''}${stockData.quote.change.toFixed(2)} (${stockData.quote.changePercent.toFixed(2)}%)`;
          
          if (stockData.indicators) {
            contextInfo += `\n- RSI: ${stockData.indicators.rsi.toFixed(1)}`;
            contextInfo += `\n- MACD: ${stockData.indicators.macd.toFixed(2)}`;
          }

          if (stockData.news && stockData.news.length > 0) {
            contextInfo += `\n- Latest News: ${stockData.news[0].title}`;
          }
        }
      }
      contextInfo += `\n\nData as of: ${new Date().toLocaleString()}\n`;
    }

    const fullPrompt = `${systemPrompt}

User Query: "${query}"

${contextInfo}

Provide a comprehensive response that:
1. Directly answers the user's question
2. Uses the live data when available
3. Explains concepts clearly
4. Provides actionable insights
5. Keeps the tone professional but accessible

Response:`;

    try {
      const response = await aiService.processChatMessage(fullPrompt);
      return response.response;
    } catch (error) {
      console.error('Error generating contextual response:', error);
      throw error;
    }
  }
}