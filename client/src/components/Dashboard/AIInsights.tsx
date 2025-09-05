import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Shield, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { StockInsight } from "@/types/stock";

interface AIInsightsProps {
  symbol: string;
}

export default function AIInsights({ symbol }: AIInsightsProps) {
  const { data: insight, isLoading } = useQuery<StockInsight>({
    queryKey: ['/api/insights', symbol],
    enabled: !!symbol,
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-accent-green/20 text-accent-green';
      case 'high':
        return 'bg-accent-red/20 text-accent-red';
      default:
        return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'bullish':
        return 'text-accent-green';
      case 'bearish':
        return 'text-accent-red';
      default:
        return 'text-slate-400';
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'bullish':
        return <TrendingUp className="w-4 h-4" />;
      case 'bearish':
        return <TrendingUp className="w-4 h-4 rotate-180" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-secondary border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Brain className="text-white text-sm" />
              </div>
              <h3 className="text-lg font-semibold text-white">AI Insights & Predictions</h3>
            </div>
            <Badge className="bg-purple-500/20 text-purple-400">87% Accuracy</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="text-white font-medium">Price Prediction</h4>
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-medium">Risk Assessment</h4>
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-medium">Recommendation</h4>
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insight) {
    return (
      <Card className="bg-secondary border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Brain className="text-white text-sm" />
              </div>
              <h3 className="text-lg font-semibold text-white">AI Insights & Predictions</h3>
            </div>
            <Badge className="bg-purple-500/20 text-purple-400">87% Accuracy</Badge>
          </div>
          
          <div className="text-center py-8 text-slate-400">
            <p>Unable to generate insights for {symbol}</p>
            <p className="text-sm mt-2">Try selecting a different stock</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-secondary border-slate-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Brain className="text-white text-sm" />
            </div>
            <h3 className="text-lg font-semibold text-white">AI Insights & Predictions</h3>
          </div>
          <Badge className="bg-purple-500/20 text-purple-400">87% Accuracy</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="text-white font-medium flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Price Prediction
            </h4>
            <div className="p-3 bg-primary rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{insight.symbol}</span>
                <div className={cn("flex items-center", getDirectionColor(insight.prediction.direction))}>
                  {getDirectionIcon(insight.prediction.direction)}
                  <span className="ml-1 font-semibold capitalize">
                    {insight.prediction.direction}
                  </span>
                </div>
              </div>
              <div className="text-slate-400 text-sm">
                <div className="flex justify-between">
                  <span>Confidence:</span>
                  <span className="text-white">{insight.prediction.confidence}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Timeframe:</span>
                  <span className="text-white">{insight.prediction.timeframe}</span>
                </div>
                {insight.prediction.targetPrice && (
                  <div className="flex justify-between">
                    <span>Target:</span>
                    <span className="text-white">₹{insight.prediction.targetPrice.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-white font-medium flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Risk Assessment
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Risk Level</span>
                <Badge className={getRiskColor(insight.riskLevel)}>
                  {insight.riskLevel.toUpperCase()}
                </Badge>
              </div>
              <div className="p-3 bg-primary rounded-lg">
                <p className="text-slate-300 text-sm">
                  {insight.reasoning}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-white font-medium">Quick Actions</h4>
            <div className="space-y-3">
              <div className={cn(
                "p-3 rounded-lg border",
                insight.prediction.direction === 'bullish'
                  ? "bg-accent-green/10 border-accent-green/30"
                  : insight.prediction.direction === 'bearish'
                  ? "bg-accent-red/10 border-accent-red/30"
                  : "bg-yellow-500/10 border-yellow-500/30"
              )}>
                <p className={cn(
                  "font-medium text-sm",
                  insight.prediction.direction === 'bullish'
                    ? "text-accent-green"
                    : insight.prediction.direction === 'bearish'
                    ? "text-accent-red"
                    : "text-yellow-400"
                )}>
                  {insight.prediction.direction === 'bullish' 
                    ? `CONSIDER: ${insight.symbol}`
                    : insight.prediction.direction === 'bearish'
                    ? `CAUTION: ${insight.symbol}`
                    : `MONITOR: ${insight.symbol}`
                  }
                </p>
                <p className="text-slate-400 text-xs">
                  Based on {insight.prediction.confidence}% confidence
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
