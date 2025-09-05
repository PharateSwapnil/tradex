import axios from 'axios';

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

class StockService {
  private readonly baseUrl = 'https://query1.finance.yahoo.com/v8/finance/chart';
  private readonly searchUrl = 'https://query2.finance.yahoo.com/v1/finance/search';

  // Convert Indian stock symbol to Yahoo Finance format
  private formatIndianSymbol(symbol: string): string {
    // Handle NIFTY indices separately
    const indexMap: { [key: string]: string } = {
      'NIFTY': '^NSEI',
      'NIFTY50': '^NSEI', 
      'SENSEX': '^BSESN',
      'NIFTYBANK': '^NSEBANK',
      'NIFTYIT': '^CNXIT',
      'NIFTYPHARMA': '^CNXPHARMA',
      'NIFTYFMCG': '^CNXFMCG',
      'NIFTYAUTO': '^CNXAUTO'
    };

    const upperSymbol = symbol.toUpperCase();
    if (indexMap[upperSymbol]) {
      return indexMap[upperSymbol];
    }

    // Add .NS suffix for NSE stocks if not present
    if (!symbol.includes('.')) {
      return `${symbol}.NS`;
    }
    return symbol;
  }

  async getStockQuote(symbol: string): Promise<StockQuote> {
    try {
      const formattedSymbol = this.formatIndianSymbol(symbol);
      const response = await axios.get(`${this.baseUrl}/${formattedSymbol}`);
      
      if (!response.data?.chart?.result?.[0]) {
        throw new Error(`Stock data not found for ${symbol}`);
      }

      const result = response.data.chart.result[0];
      const meta = result.meta;
      const quote = result.indicators.quote[0];
      
      const currentPrice = meta.regularMarketPrice || meta.previousClose;
      const previousClose = meta.previousClose;
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;

      return {
        symbol: symbol.toUpperCase(),
        companyName: meta.shortName || meta.longName || symbol,
        price: currentPrice,
        change,
        changePercent,
        volume: meta.regularMarketVolume || 0,
        marketCap: meta.marketCap,
        pe: meta.trailingPE,
        dayHigh: meta.regularMarketDayHigh || currentPrice,
        dayLow: meta.regularMarketDayLow || currentPrice,
        yearHigh: meta.fiftyTwoWeekHigh || currentPrice,
        yearLow: meta.fiftyTwoWeekLow || currentPrice,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      throw new Error(`Failed to fetch stock data for ${symbol}`);
    }
  }

  async getHistoricalData(symbol: string, period: string = '1mo'): Promise<HistoricalData[]> {
    try {
      const formattedSymbol = this.formatIndianSymbol(symbol);
      const response = await axios.get(`${this.baseUrl}/${formattedSymbol}`, {
        params: {
          range: period,
          interval: period.includes('d') && period !== '1d' ? '1h' : '1d'
        }
      });

      if (!response.data?.chart?.result?.[0]) {
        throw new Error(`Historical data not found for ${symbol}`);
      }

      const result = response.data.chart.result[0];
      const timestamps = result.timestamp;
      const quote = result.indicators.quote[0];

      if (!timestamps || !quote) {
        return [];
      }

      return timestamps.map((timestamp: number, index: number) => ({
        date: new Date(timestamp * 1000).toISOString().split('T')[0],
        open: quote.open[index] || 0,
        high: quote.high[index] || 0,
        low: quote.low[index] || 0,
        close: quote.close[index] || 0,
        volume: quote.volume[index] || 0,
      })).filter((data: HistoricalData) => data.close > 0);
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      throw new Error(`Failed to fetch historical data for ${symbol}`);
    }
  }

  async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicators> {
    try {
      const historicalData = await this.getHistoricalData(symbol, '3mo');
      if (historicalData.length < 50) {
        throw new Error('Insufficient data for technical analysis');
      }

      const closes = historicalData.map(d => d.close);
      
      // Calculate RSI (14-period)
      const rsi = this.calculateRSI(closes, 14);
      
      // Calculate SMA (20-period)
      const sma20 = this.calculateSMA(closes, 20);
      
      // Calculate EMA (50-period)
      const ema50 = this.calculateEMA(closes, 50);
      
      // Calculate MACD
      const macdData = this.calculateMACD(closes);
      
      // Calculate Bollinger Bands
      const bollinger = this.calculateBollingerBands(closes, 20, 2);

      return {
        rsi: rsi[rsi.length - 1] || 0,
        macd: macdData.macd[macdData.macd.length - 1] || 0,
        signal: macdData.signal[macdData.signal.length - 1] || 0,
        histogram: macdData.histogram[macdData.histogram.length - 1] || 0,
        sma20: sma20[sma20.length - 1] || 0,
        ema50: ema50[ema50.length - 1] || 0,
        bollinger: bollinger[bollinger.length - 1] || { upper: 0, middle: 0, lower: 0 }
      };
    } catch (error) {
      console.error(`Error calculating technical indicators for ${symbol}:`, error);
      throw new Error(`Failed to calculate technical indicators for ${symbol}`);
    }
  }

  async getMarketIndices(): Promise<MarketIndex[]> {
    const indices = [
      { symbol: '^NSEI', name: 'NIFTY 50' },
      { symbol: '^BSESN', name: 'SENSEX' },
      { symbol: '^NSEBANK', name: 'BANK NIFTY' },
      { symbol: '^CNXIT', name: 'NIFTY IT' }
    ];

    const results = await Promise.allSettled(
      indices.map(async (index) => {
        const response = await axios.get(`${this.baseUrl}/${index.symbol}`);
        const result = response.data.chart.result[0];
        const meta = result.meta;
        
        const currentPrice = meta.regularMarketPrice || meta.previousClose;
        const previousClose = meta.previousClose;
        const change = currentPrice - previousClose;
        const changePercent = (change / previousClose) * 100;

        return {
          name: index.name,
          symbol: index.symbol,
          value: currentPrice,
          change,
          changePercent
        };
      })
    );

    return results
      .filter((result): result is PromiseFulfilledResult<MarketIndex> => result.status === 'fulfilled')
      .map(result => result.value);
  }

  async searchStocks(query: string): Promise<Array<{symbol: string, name: string}>> {
    try {
      // Include NIFTY indices in search
      const indices = [
        { symbol: 'NIFTY', name: 'NIFTY 50 Index' },
        { symbol: 'NIFTY50', name: 'NIFTY 50 Index' },
        { symbol: 'NIFTYBANK', name: 'NIFTY Bank Index' },
        { symbol: 'NIFTYIT', name: 'NIFTY IT Index' },
        { symbol: 'NIFTYPHARMA', name: 'NIFTY Pharma Index' },
        { symbol: 'NIFTYFMCG', name: 'NIFTY FMCG Index' },
        { symbol: 'NIFTYAUTO', name: 'NIFTY Auto Index' },
        { symbol: 'SENSEX', name: 'BSE SENSEX Index' }
      ];
      
      const indexResults = indices.filter(index => 
        index.symbol.toLowerCase().includes(query.toLowerCase()) ||
        index.name.toLowerCase().includes(query.toLowerCase())
      );

      const response = await axios.get(this.searchUrl, {
        params: {
          q: query,
          quotesCount: 10,
          newsCount: 0,
          enableFuzzyQuery: false,
          quotesQueryId: 'tss_match_phrase_query'
        }
      });

      const quotes = response.data.quotes || [];
      const stockResults = quotes
        .filter((quote: any) => quote.exchange === 'NSI' || quote.symbol.endsWith('.NS'))
        .map((quote: any) => ({
          symbol: quote.symbol.replace('.NS', ''),
          name: quote.shortname || quote.longname || quote.symbol
        }));

      // Combine index and stock results, prioritizing indices for NIFTY searches
      return [...indexResults, ...stockResults].slice(0, 10);
    } catch (error) {
      console.error('Error searching stocks:', error);
      // Return indices if API fails
      const indices = [
        { symbol: 'NIFTY', name: 'NIFTY 50 Index' },
        { symbol: 'NIFTY50', name: 'NIFTY 50 Index' },
        { symbol: 'SENSEX', name: 'BSE SENSEX Index' }
      ];
      
      return indices.filter(index => 
        index.symbol.toLowerCase().includes(query.toLowerCase()) ||
        index.name.toLowerCase().includes(query.toLowerCase())
      );
    }
  }

  // Technical indicator calculation methods
  private calculateRSI(prices: number[], period: number): number[] {
    const rsi: number[] = [];
    let gains = 0;
    let losses = 0;

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (i <= period) {
        if (change > 0) gains += change;
        else losses -= change;
        
        if (i === period) {
          const avgGain = gains / period;
          const avgLoss = losses / period;
          const rs = avgGain / avgLoss;
          rsi.push(100 - (100 / (1 + rs)));
        }
      } else {
        const prevAvgGain = gains / period;
        const prevAvgLoss = losses / period;
        
        const avgGain = ((prevAvgGain * (period - 1)) + Math.max(0, change)) / period;
        const avgLoss = ((prevAvgLoss * (period - 1)) + Math.max(0, -change)) / period;
        
        gains = avgGain * period;
        losses = avgLoss * period;
        
        const rs = avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
      }
    }

    return rsi;
  }

  private calculateSMA(prices: number[], period: number): number[] {
    const sma: number[] = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  }

  private calculateEMA(prices: number[], period: number): number[] {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    ema[0] = prices[0];
    for (let i = 1; i < prices.length; i++) {
      ema[i] = (prices[i] * multiplier) + (ema[i - 1] * (1 - multiplier));
    }
    
    return ema.slice(period - 1);
  }

  private calculateMACD(prices: number[]): { macd: number[], signal: number[], histogram: number[] } {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    
    const macd = ema12.map((ema12Val, i) => ema12Val - ema26[i]).filter(val => !isNaN(val));
    const signal = this.calculateEMA(macd, 9);
    const histogram = macd.slice(-signal.length).map((macdVal, i) => macdVal - signal[i]);
    
    return { macd, signal, histogram };
  }

  private calculateBollingerBands(prices: number[], period: number, stdDev: number): Array<{upper: number, middle: number, lower: number}> {
    const sma = this.calculateSMA(prices, period);
    const bands = [];
    
    for (let i = 0; i < sma.length; i++) {
      const slice = prices.slice(i, i + period);
      const mean = sma[i];
      const variance = slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
      const standardDev = Math.sqrt(variance);
      
      bands.push({
        upper: mean + (standardDev * stdDev),
        middle: mean,
        lower: mean - (standardDev * stdDev)
      });
    }
    
    return bands;
  }
}

export const stockService = new StockService();
