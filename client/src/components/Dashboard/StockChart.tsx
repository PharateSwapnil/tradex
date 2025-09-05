import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowUp } from "lucide-react";
import { useStockQuote, useHistoricalData } from "@/hooks/useStockData";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StockChartProps {
  symbol: string;
}

const timeframes = [
  { label: "1D", value: "1d" },
  { label: "5D", value: "5d" },
  { label: "1M", value: "1mo" },
  { label: "6M", value: "6mo" },
  { label: "1Y", value: "1y" }
];

const indicators = [
  { label: "RSI", active: true },
  { label: "MACD", active: false },
  { label: "SMA", active: false }
];

export default function StockChart({ symbol }: StockChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1d");
  const [activeIndicators, setActiveIndicators] = useState(["RSI"]);
  
  const { data: quote, isLoading: quoteLoading } = useStockQuote(symbol);
  const { data: historicalData, isLoading: historyLoading } = useHistoricalData(symbol, selectedTimeframe);

  const toggleIndicator = (indicator: string) => {
    setActiveIndicators(prev => 
      prev.includes(indicator) 
        ? prev.filter(i => i !== indicator)
        : [...prev, indicator]
    );
  };

  if (quoteLoading) {
    return (
      <Card className="bg-secondary border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="text-right">
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!quote) {
    return (
      <Card className="bg-secondary border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-80 text-slate-400">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Unable to load stock data for {symbol}</p>
              <p className="text-sm mt-2">Please check the symbol and try again</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-secondary border-slate-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">{symbol}</h2>
            <p className="text-slate-400 text-sm">{quote.companyName}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">
              ₹{quote.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className={cn(
              "text-sm flex items-center justify-end",
              quote.change >= 0 ? "text-accent-green" : "text-accent-red"
            )}>
              {quote.change >= 0 ? (
                <ArrowUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingUp className="w-4 h-4 mr-1 rotate-180" />
              )}
              <span>
                ₹{Math.abs(quote.change).toFixed(2)} ({Math.abs(quote.changePercent).toFixed(2)}%)
              </span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex bg-primary rounded-lg p-1">
            {timeframes.map((timeframe) => (
              <Button
                key={timeframe.value}
                variant="ghost"
                size="sm"
                className={cn(
                  "px-3 py-1 rounded text-sm",
                  selectedTimeframe === timeframe.value
                    ? "bg-accent-blue text-white"
                    : "text-slate-400 hover:text-white"
                )}
                onClick={() => setSelectedTimeframe(timeframe.value)}
              >
                {timeframe.label}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-slate-400">Indicators:</span>
            {indicators.map((indicator) => (
              <Button
                key={indicator.label}
                variant="ghost"
                size="sm"
                className={cn(
                  "px-2 py-1 rounded text-xs",
                  activeIndicators.includes(indicator.label)
                    ? "bg-accent-blue/20 text-accent-blue"
                    : "bg-primary text-slate-400 hover:bg-accent-blue/20 hover:text-accent-blue"
                )}
                onClick={() => toggleIndicator(indicator.label)}
              >
                {indicator.label}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="h-80 bg-primary rounded-lg p-4">
          {historyLoading ? (
            <div className="flex items-center justify-center h-full text-slate-400">Loading chart data...</div>
          ) : historicalData && historicalData.length > 0 ? (
            <div className="h-full">
              <div className="h-full flex items-end justify-between px-2 pb-4 pt-8">
                {historicalData.slice(-20).map((dataPoint, index) => {
                  const maxPrice = Math.max(...historicalData.slice(-20).map(d => d.close));
                  const minPrice = Math.min(...historicalData.slice(-20).map(d => d.close));
                  const normalizedHeight = ((dataPoint.close - minPrice) / (maxPrice - minPrice)) * 200 + 20;
                  const isPositive = index > 0 ? dataPoint.close > historicalData[historicalData.length - 20 + index - 1].close : true;
                  
                  return (
                    <div key={index} className="flex flex-col items-center space-y-2">
                      <div 
                        className={cn(
                          "w-3 rounded-t transition-all duration-200",
                          isPositive ? "bg-accent-green" : "bg-accent-red"
                        )}
                        style={{ height: `${normalizedHeight}px` }}
                        title={`₹${dataPoint.close.toFixed(2)} on ${dataPoint.date}`}
                      />
                      {index % 4 === 0 && (
                        <span className="text-xs text-slate-500 rotate-45 whitespace-nowrap">
                          {new Date(dataPoint.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>Price Range: ₹{Math.min(...historicalData.slice(-20).map(d => d.close)).toFixed(2)} - ₹{Math.max(...historicalData.slice(-20).map(d => d.close)).toFixed(2)}</span>
                <span>{historicalData.length} data points</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center text-slate-400">
              <div>
                <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No chart data available for {symbol}</p>
                <p className="text-sm mt-2">Please try a different timeframe or stock symbol</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
