import { useState } from "react";
import { Send, Bot, User, TrendingUp, Brain, Bell, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useChat } from "@/hooks/useChat";
import { useQuery } from "@tanstack/react-query";
import { useStockQuote } from "@/hooks/useStockData";
import { useTechnicalIndicators } from "@/hooks/useStockData";
import { cn } from "@/lib/utils";

interface IntegratedChatbotProps {
  userId: string;
  selectedStock: string;
}

interface MarketNews {
  articles: Array<{
    title: string;
    description: string;
    publishedAt: string;
    source: { name: string };
    url: string;
    sentiment?: string;
  }>;
  lastUpdated: string;
}

interface StockInsight {
  symbol: string;
  prediction: {
    direction: string;
    confidence: number;
    targetPrice: number;
    timeframe: string;
  };
  riskAssessment: {
    level: string;
    factors: string[];
  };
  recommendation: {
    action: string;
    reason: string;
  };
}

export default function IntegratedChatbot({ userId, selectedStock }: IntegratedChatbotProps) {
  const [inputMessage, setInputMessage] = useState("");
  const { 
    chatHistory, 
    sendMessage, 
    isLoading, 
    historyLoading 
  } = useChat(userId);

  const { data: quote } = useStockQuote(selectedStock);
  const { data: indicators } = useTechnicalIndicators(selectedStock);
  
  const { data: news } = useQuery<MarketNews>({
    queryKey: ['/api/news'],
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: insight } = useQuery<StockInsight>({
    queryKey: ['/api/insights', selectedStock],
    enabled: !!selectedStock,
  });

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage;
    if (!messageToSend.trim()) return;
    
    try {
      await sendMessage(messageToSend);
      setInputMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-accent-green/20 text-accent-green border-accent-green';
      case 'negative':
        return 'bg-accent-red/20 text-accent-red border-accent-red';
      default:
        return 'bg-accent-blue/20 text-accent-blue border-accent-blue';
    }
  };

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

  return (
    <div className="h-full flex flex-col bg-secondary border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-slate-800/50 to-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <Bot className="text-white w-4 h-4" />
          </div>
          <div>
            <h4 className="text-white font-semibold text-lg">StockGuru AI</h4>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
              <span className="text-slate-400 text-xs">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Summary */}
      <div className="p-4 border-b border-slate-700 space-y-4">
        {/* Current Stock Info */}
        {quote && (
          <Card className="bg-primary border-slate-600">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-semibold">{selectedStock}</h4>
                  <p className="text-slate-400 text-xs">{quote.companyName}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">₹{quote.price.toFixed(2)}</p>
                  <p className={cn(
                    "text-xs flex items-center justify-end",
                    quote.change >= 0 ? "text-accent-green" : "text-accent-red"
                  )}>
                    <TrendingUp className={cn(
                      "w-3 h-3 mr-1",
                      quote.change < 0 && "rotate-180"
                    )} />
                    {quote.change.toFixed(2)} ({quote.changePercent.toFixed(2)}%)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Technical Indicators */}
        {indicators && (
          <Card className="bg-primary border-slate-600">
            <CardContent className="p-3">
              <h4 className="text-white font-semibold text-sm mb-2">Technical Indicators</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">RSI:</span>
                  <span className="text-white ml-1">{indicators.rsi.toFixed(1)}</span>
                </div>
                <div>
                  <span className="text-slate-400">MACD:</span>
                  <span className="text-white ml-1">{indicators.macd.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-400">SMA(20):</span>
                  <span className="text-white ml-1">₹{indicators.sma20.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-400">EMA(50):</span>
                  <span className="text-white ml-1">₹{indicators.ema50.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Market Sentiment */}
        {news && news.articles.length > 0 && (
          <Card className="bg-primary border-slate-600">
            <CardContent className="p-3">
              <h4 className="text-white font-semibold text-sm mb-2 flex items-center">
                <Bell className="w-4 h-4 mr-1" />
                Latest News
              </h4>
              <div className="space-y-2">
                {news.articles.slice(0, 2).map((article, index) => (
                  <div key={index} className="text-xs">
                    <p className="text-white line-clamp-2">{article.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-slate-400">{article.source.name}</span>
                      {article.sentiment && (
                        <Badge className={cn("text-xs py-0 px-1", getSentimentColor(article.sentiment))}>
                          {article.sentiment}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Insights */}
        {insight && (
          <Card className="bg-primary border-slate-600">
            <CardContent className="p-3">
              <h4 className="text-white font-semibold text-sm mb-2 flex items-center">
                <Brain className="w-4 h-4 mr-1" />
                AI Prediction
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Direction:</span>
                  <span className={cn(
                    "font-medium",
                    insight.prediction.direction === 'bullish' ? "text-accent-green" : "text-accent-red"
                  )}>
                    {insight.prediction.direction.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target:</span>
                  <span className="text-white">₹{insight.prediction.targetPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Risk:</span>
                  <Badge className={cn("text-xs py-0 px-1", getRiskColor(insight.riskAssessment?.level || 'medium'))}>
                    {(insight.riskAssessment?.level || 'medium').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-slate-900/20 to-slate-800/20">
        {historyLoading ? (
          <div className="text-center text-slate-400 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue mx-auto mb-2"></div>
            <p className="text-sm">Loading chat history...</p>
          </div>
        ) : chatHistory.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">Ask me anything about {selectedStock} or the stock market!</p>
            <div className="mt-4 space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs border-slate-600 hover:bg-slate-700"
                onClick={() => handleSendMessage(`What's the outlook for ${selectedStock}?`)}
              >
                What's the outlook for {selectedStock}?
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs border-slate-600 hover:bg-slate-700"
                onClick={() => handleSendMessage("What are the current market trends?")}
              >
                What are the current market trends?
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs border-slate-600 hover:bg-slate-700"
                onClick={() => handleSendMessage(`Should I buy ${selectedStock} now?`)}
              >
                Should I buy {selectedStock} now?
              </Button>
            </div>
          </div>
        ) : (
          chatHistory.map((message) => (
            <div key={message.id}>
              {/* User Message */}
              <div className="flex items-start space-x-3 justify-end mb-4">
                <div className="max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed bg-accent-blue text-white rounded-br-md">
                  <div className="whitespace-pre-wrap">{message.message}</div>
                  <div className="text-xs mt-2 opacity-70 text-blue-100">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className="w-7 h-7 bg-accent-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="text-white w-3 h-3" />
                </div>
              </div>
              
              {/* Assistant Response */}
              {message.response && (
                <div className="flex items-start space-x-3 justify-start mb-4">
                  <div className="w-7 h-7 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="text-white w-3 h-3" />
                  </div>
                  <div className="max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed bg-slate-700/50 text-slate-100 rounded-bl-md border border-slate-600">
                    <div className="whitespace-pre-wrap">{message.response}</div>
                    <div className="text-xs mt-2 opacity-70 text-slate-400">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-7 h-7 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="text-white w-3 h-3" />
            </div>
            <div className="bg-slate-700/50 border border-slate-600 p-3 rounded-2xl rounded-bl-md text-sm">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-accent-blue rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-accent-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-accent-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-slate-400 text-xs">Analyzing...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-700 bg-gradient-to-r from-slate-800/30 to-slate-700/30">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Ask about stocks, market trends, analysis..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-primary border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-accent-blue text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-accent-blue hover:bg-accent-blue/80 text-white p-2 rounded-xl flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">
          Ask me anything about {selectedStock} or stock market analysis
        </p>
      </div>
    </div>
  );
}