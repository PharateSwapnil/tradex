import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useTechnicalIndicators } from "@/hooks/useStockData";
import { Skeleton } from "@/components/ui/skeleton";

interface TechnicalIndicatorsProps {
  symbol: string;
}

export default function TechnicalIndicators({ symbol }: TechnicalIndicatorsProps) {
  const { data: indicators, isLoading } = useTechnicalIndicators(symbol);

  const getRSIStatus = (rsi: number) => {
    if (rsi > 70) return { label: "Overbought", color: "bg-accent-red/20 text-accent-red" };
    if (rsi < 30) return { label: "Oversold", color: "bg-accent-green/20 text-accent-green" };
    return { label: "Neutral", color: "bg-yellow-500/20 text-yellow-400" };
  };

  const getMACDStatus = (macd: number) => {
    if (macd > 0) return { label: "Bullish", color: "bg-accent-green/20 text-accent-green" };
    if (macd < 0) return { label: "Bearish", color: "bg-accent-red/20 text-accent-red" };
    return { label: "Neutral", color: "bg-yellow-500/20 text-yellow-400" };
  };

  if (isLoading) {
    return (
      <Card className="bg-secondary border-slate-700">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Technical Indicators</h3>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!indicators) {
    return (
      <Card className="bg-secondary border-slate-700">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Technical Indicators</h3>
          <div className="text-center py-8 text-slate-400">
            <p>Unable to load technical indicators for {symbol}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const rsiStatus = getRSIStatus(indicators.rsi);
  const macdStatus = getMACDStatus(indicators.macd);

  return (
    <div className="space-y-6">
      <Card className="bg-secondary border-slate-700">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Technical Indicators</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">RSI (14)</span>
              <div className="flex items-center space-x-2">
                <span className="text-white font-medium">{indicators.rsi.toFixed(1)}</span>
                <Badge className={rsiStatus.color}>{rsiStatus.label}</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-400">MACD</span>
              <div className="flex items-center space-x-2">
                <span className="text-white font-medium">{indicators.macd.toFixed(2)}</span>
                <Badge className={macdStatus.color}>{macdStatus.label}</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-400">SMA (20)</span>
              <span className="text-white font-medium">
                ₹{indicators.sma20.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-400">EMA (50)</span>
              <span className="text-white font-medium">
                ₹{indicators.ema50.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Bollinger Upper</span>
              <span className="text-white font-medium">
                ₹{indicators.bollinger.upper.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-secondary border-slate-700">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Market Sentiment</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Overall Sentiment</span>
              <Badge className="bg-accent-green/20 text-accent-green">Positive</Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">News Sentiment</span>
                <span className="text-white">72%</span>
              </div>
              <Progress value={72} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Social Media</span>
                <span className="text-white">68%</span>
              </div>
              <Progress value={68} className="h-2" />
            </div>
            
            <div className="pt-2 border-t border-slate-700">
              <p className="text-xs text-slate-400">Updated 5 mins ago</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
