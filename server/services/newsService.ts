import axios from 'axios';
import { aiService, type SentimentAnalysis } from './aiService';

export interface NewsArticle {
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  url: string;
  sentiment?: SentimentAnalysis;
  relatedSymbols?: string[];
}

export interface MarketNews {
  articles: NewsArticle[];
  lastUpdated: string;
}

class NewsService {
  private readonly tavilyApiKey = process.env.TAVILY_API_KEY;
  
  private cache: Map<string, { data: MarketNews, timestamp: number }> = new Map();
  private readonly cacheTimeout = 15 * 60 * 1000; // 15 minutes

  async getMarketNews(symbols?: string[]): Promise<MarketNews> {
    const cacheKey = symbols ? symbols.join(',') : 'general';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      let query = 'Indian stock market BSE NSE NIFTY SENSEX latest news';
      
      if (symbols && symbols.length > 0) {
        query = `${symbols.join(' ')} Indian stock market news`;
      }

      // Use Tavily REST API directly
      const response = await axios.post('https://api.tavily.com/search', {
        api_key: this.tavilyApiKey,
        query: query,
        search_depth: 'basic',
        include_answer: false,
        include_images: false,
        include_raw_content: false,
        max_results: 10,
        include_domains: [
          'economictimes.indiatimes.com',
          'business-standard.com', 
          'livemint.com',
          'moneycontrol.com',
          'zeebiz.com',
          'thehindubusinessline.com',
          'financialexpress.com'
        ]
      });

      const searchResults = response.data;
      
      const articles = await Promise.all(
        searchResults.results.map(async (result: any) => {
          const processedArticle: NewsArticle = {
            title: result.title,
            summary: result.content?.substring(0, 300) + '...' || result.title,
            source: this.extractSourceName(result.url),
            publishedAt: result.published_date || new Date().toISOString(),
            url: result.url,
            relatedSymbols: this.extractStockSymbols(result.title + ' ' + (result.content || ''))
          };

          // Add sentiment analysis with AI
          try {
            processedArticle.sentiment = await aiService.analyzeSentiment(
              processedArticle.title + ' ' + processedArticle.summary
            );
          } catch (error) {
            console.error('Error analyzing sentiment for article:', error);
            processedArticle.sentiment = {
              sentiment: 'neutral',
              score: 50,
              confidence: 0.5
            };
          }

          return processedArticle;
        })
      );

      const marketNews: MarketNews = {
        articles: articles.filter((a: NewsArticle) => a.title && a.summary),
        lastUpdated: new Date().toISOString()
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: marketNews,
        timestamp: Date.now()
      });

      return marketNews;
    } catch (error) {
      console.error('Error fetching news with Tavily:', error);
      
      // Return cached data if available, otherwise empty result
      if (cached) {
        return cached.data;
      }
      
      return {
        articles: [],
        lastUpdated: new Date().toISOString()
      };
    }
  }

  async getStockSpecificNews(symbol: string): Promise<NewsArticle[]> {
    const news = await this.getMarketNews([symbol]);
    return news.articles.filter(article => 
      article.relatedSymbols?.includes(symbol) ||
      article.title.toLowerCase().includes(symbol.toLowerCase()) ||
      article.summary.toLowerCase().includes(symbol.toLowerCase())
    );
  }

  private extractSourceName(sourceName: string): string {
    const sourceMap: Record<string, string> = {
      'economictimes.indiatimes.com': 'Economic Times',
      'business-standard.com': 'Business Standard',
      'livemint.com': 'Mint',
      'moneycontrol.com': 'MoneyControl',
      'zeebiz.com': 'Zee Business'
    };

    const domain = Object.keys(sourceMap).find(domain => sourceName.includes(domain));
    return domain ? sourceMap[domain] : sourceName;
  }

  private extractStockSymbols(text: string): string[] {
    const symbols: string[] = [];
    
    // Common Indian stock symbols patterns
    const symbolPatterns = [
      /\b(RELIANCE|RIL)\b/gi,
      /\b(TCS|TATA CONSULTANCY)\b/gi,
      /\b(INFY|INFOSYS)\b/gi,
      /\b(HDFCBANK|HDFC BANK)\b/gi,
      /\b(ICICIBANK|ICICI BANK)\b/gi,
      /\b(BHARTIARTL|BHARTI AIRTEL)\b/gi,
      /\b(SBIN|SBI)\b/gi,
      /\b(LT|LARSEN)\b/gi,
      /\b(ASIANPAINT|ASIAN PAINTS)\b/gi,
      /\b(MARUTI|MARUTI SUZUKI)\b/gi
    ];

    const symbolMap: Record<string, string> = {
      'RIL': 'RELIANCE',
      'TATA CONSULTANCY': 'TCS',
      'INFOSYS': 'INFY',
      'HDFC BANK': 'HDFCBANK',
      'ICICI BANK': 'ICICIBANK',
      'BHARTI AIRTEL': 'BHARTIARTL',
      'SBI': 'SBIN',
      'LARSEN': 'LT',
      'ASIAN PAINTS': 'ASIANPAINT',
      'MARUTI SUZUKI': 'MARUTI'
    };

    symbolPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const normalizedSymbol = symbolMap[match.toUpperCase()] || match.toUpperCase();
          if (!symbols.includes(normalizedSymbol)) {
            symbols.push(normalizedSymbol);
          }
        });
      }
    });

    return symbols;
  }

  async getMarketSentimentScore(): Promise<{
    overall: number;
    positive: number;
    negative: number;
    neutral: number;
  }> {
    try {
      const news = await this.getMarketNews();
      
      if (news.articles.length === 0) {
        return { overall: 50, positive: 33, negative: 33, neutral: 34 };
      }

      const sentiments = news.articles
        .filter(article => article.sentiment)
        .map(article => article.sentiment!);

      const positive = sentiments.filter(s => s.sentiment === 'positive').length;
      const negative = sentiments.filter(s => s.sentiment === 'negative').length;
      const neutral = sentiments.filter(s => s.sentiment === 'neutral').length;
      
      const total = sentiments.length;
      const avgScore = sentiments.reduce((sum, s) => sum + s.score, 0) / total;

      return {
        overall: Math.round(avgScore),
        positive: Math.round((positive / total) * 100),
        negative: Math.round((negative / total) * 100),
        neutral: Math.round((neutral / total) * 100)
      };
    } catch (error) {
      console.error('Error calculating market sentiment:', error);
      return { overall: 50, positive: 33, negative: 33, neutral: 34 };
    }
  }
}

export const newsService = new NewsService();
