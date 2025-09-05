import { aiService } from './aiService';

export interface QueryClassification {
  type: 'MARKET_DATA' | 'GENERAL_EXPLANATION' | 'MIXED';
  confidence: number;
  stockSymbols?: string[];
  needsLiveData: boolean;
  explanation: string;
}

export class QueryAnalyzer {
  constructor() {}

  async classifyQuery(query: string): Promise<QueryClassification> {
    const classificationPrompt = `
You are a financial query classifier. Analyze the user query and classify it into one of three categories:

(A) MARKET_DATA - Needs live stock/market data (current prices, technical indicators, recent news)
(B) GENERAL_EXPLANATION - Only needs financial education/explanation (definitions, concepts, strategies)  
(C) MIXED - Needs both live data AND explanation (explain concept + show current data)

Examples:
- "What is the current price of RELIANCE?" → MARKET_DATA
- "What is RSI in trading?" → GENERAL_EXPLANATION  
- "What is RSI and what is RELIANCE's current RSI?" → MIXED
- "Show me NIFTY 50 performance today" → MARKET_DATA
- "How do I calculate P/E ratio?" → GENERAL_EXPLANATION
- "What is Bollinger Bands and how does it look for SBIN?" → MIXED

Extract any stock symbols mentioned (RELIANCE, SBIN, NIFTY, SENSEX, etc.).

User Query: "${query}"

Respond with JSON:
{
  "type": "MARKET_DATA|GENERAL_EXPLANATION|MIXED",
  "confidence": 0.0-1.0,
  "stockSymbols": ["SYMBOL1", "SYMBOL2"],
  "needsLiveData": true/false,
  "explanation": "Brief reason for classification"
}`;

    try {
      const response = await aiService.processChatMessage(classificationPrompt);
      const aiResponse = response.response;

      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const classification = JSON.parse(jsonMatch[0]);
        return {
          type: classification.type || 'GENERAL_EXPLANATION',
          confidence: classification.confidence || 0.7,
          stockSymbols: classification.stockSymbols || [],
          needsLiveData: classification.needsLiveData || false,
          explanation: classification.explanation || 'Query classified using AI'
        };
      }
    } catch (error) {
      console.error('Query classification failed:', error);
    }

    // Fallback rule-based classification
    return this.fallbackClassification(query);
  }

  private fallbackClassification(query: string): QueryClassification {
    const lowerQuery = query.toLowerCase();
    
    // Extract potential stock symbols (2-6 uppercase letters or common stock names)
    const stockMatches = query.match(/\b[A-Z]{2,6}\b/g) || [];
    const knownIndices = ['nifty', 'sensex', 'banknifty', 'niftybank'];
    const indexMatches = knownIndices.filter(index => lowerQuery.includes(index));
    
    // Technical indicators to exclude from stock symbols
    const technicalIndicators = ['rsi', 'macd', 'sma', 'ema', 'bollinger', 'stochastic'];
    
    // Filter out technical indicators from stock matches
    const filteredStockMatches = stockMatches.filter(symbol => 
      !technicalIndicators.includes(symbol.toLowerCase())
    );
    
    // Common Indian stock names (case insensitive)
    const commonStocks = ['reliance', 'tcs', 'infy', 'hdfc', 'icici', 'sbi', 'wipro', 'bharti', 'itc', 'hindunilvr', 'adani', 'bajaj'];
    const stockNameMatches = commonStocks.filter(stock => lowerQuery.includes(stock)).map(s => s.toUpperCase());
    
    // Special case mappings
    const stockMappings: Record<string, string> = {
      'reliance': 'RELIANCE',
      'tcs': 'TCS',
      'infosys': 'INFY',
      'hdfc': 'HDFCBANK',
      'icici': 'ICICIBANK',
      'sbi': 'SBIN',
      'state bank': 'SBIN'
    };
    
    const mappedStocks = Object.keys(stockMappings).filter(name => lowerQuery.includes(name)).map(name => stockMappings[name]);
    
    // Remove duplicates and empty strings
    const combinedSymbols = [...filteredStockMatches, ...indexMatches.map(i => i.toUpperCase()), ...stockNameMatches, ...mappedStocks];
    const allSymbols = Array.from(new Set(combinedSymbols)).filter(s => s && s.length > 0);
    
    console.log(`🔍 Query: "${query}" | Detected symbols: [${allSymbols.join(', ')}] | Lower query: "${lowerQuery}"`);

    // Market data indicators
    const marketDataKeywords = [
      'price', 'current', 'today', 'latest', 'now', 'recent', 'live',
      'performance', 'chart', 'graph', 'technical', 'rsi', 'macd',
      'news', 'analysis', 'trend', 'movement', 'volume'
    ];

    // Educational keywords
    const educationKeywords = [
      'what is', 'how to', 'explain', 'definition', 'meaning', 'concept',
      'calculate', 'formula', 'example', 'difference between', 'types of'
    ];

    const hasMarketData = marketDataKeywords.some(keyword => lowerQuery.includes(keyword));
    const hasEducation = educationKeywords.some(keyword => lowerQuery.includes(keyword));
    const hasStockSymbols = allSymbols.length > 0;

    if (hasEducation && (hasMarketData || hasStockSymbols)) {
      return {
        type: 'MIXED',
        confidence: 0.8,
        stockSymbols: allSymbols,
        needsLiveData: true,
        explanation: 'Query requires both explanation and live data'
      };
    }

    if (hasMarketData || hasStockSymbols) {
      return {
        type: 'MARKET_DATA',
        confidence: 0.9,
        stockSymbols: allSymbols,
        needsLiveData: true,
        explanation: 'Query requires live market data'
      };
    }

    return {
      type: 'GENERAL_EXPLANATION',
      confidence: 0.7,
      stockSymbols: [],
      needsLiveData: false,
      explanation: 'Query is educational/explanatory'
    };
  }
}