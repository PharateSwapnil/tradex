export interface StockQuote {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  dayHigh: number;
  dayLow: number;
  yearHigh: number;
  yearLow: number;
  timestamp: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: number;
  signal: number;
  histogram: number;
  sma20: number;
  ema50: number;
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
}

export interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface NewsArticle {
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  url: string;
  sentiment?: {
    sentiment: 'positive' | 'negative' | 'neutral';
    score: number;
    confidence: number;
  };
  relatedSymbols?: string[];
}

export interface WatchlistItem {
  id: string;
  userId: string;
  symbol: string;
  companyName: string;
  addedAt: Date;
  quote?: StockQuote;
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
