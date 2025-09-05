import { useQuery } from "@tanstack/react-query";
import type { StockQuote, TechnicalIndicators, HistoricalData, MarketIndex } from "@/types/stock";

export function useStockQuote(symbol: string) {
  return useQuery<StockQuote>({
    queryKey: ['/api/stocks', symbol],
    enabled: !!symbol,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useTechnicalIndicators(symbol: string) {
  return useQuery<TechnicalIndicators>({
    queryKey: ['/api/stocks', symbol, 'technical'],
    enabled: !!symbol,
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useHistoricalData(symbol: string, period: string = '1mo') {
  return useQuery<HistoricalData[]>({
    queryKey: ['/api/stocks', symbol, 'historical'],
    enabled: !!symbol,
  });
}

export function useMarketIndices() {
  return useQuery<MarketIndex[]>({
    queryKey: ['/api/market/indices'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useStockSearch(query: string) {
  return useQuery<Array<{symbol: string; name: string}>>({
    queryKey: ['/api/stocks/search', query],
    enabled: !!query && query.length > 1,
  });
}
