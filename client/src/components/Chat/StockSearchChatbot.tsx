import { useState, useEffect } from "react";
import { Search, Send, Bot, User, TrendingUp, Brain, Trash2, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useChat } from "@/hooks/useChat";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStockQuote, useTechnicalIndicators, useStockSearch } from "@/hooks/useStockData";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface StockSearchChatbotProps {
  userId: string;
  initialStock: string;
  onStockChange: (stock: string) => void;
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
    targetPrice?: number;
    timeframe: string;
  };
  reasoning: string;
  riskLevel: string;
  recommendation?: {
    action: string;
    reason: string;
  };
}

export default function StockSearchChatbot({ userId, initialStock, onStockChange }: StockSearchChatbotProps) {
  const [selectedStock, setSelectedStock] = useState(initialStock);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [chatWidth, setChatWidth] = useState(350); // Resizable chat panel
  const [isDragging, setIsDragging] = useState(false);
  
  // Resizer functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newWidth = window.innerWidth - e.clientX;
      setChatWidth(Math.max(280, Math.min(800, newWidth)));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);
  const queryClient = useQueryClient();
  
  const { 
    chatHistory, 
    sendMessage, 
    isLoading, 
    historyLoading 
  } = useChat(userId);

  const { data: quote, isLoading: quoteLoading } = useStockQuote(selectedStock);
  const { data: indicators, isLoading: indicatorsLoading } = useTechnicalIndicators(selectedStock);
  const { data: searchResults } = useStockSearch(searchQuery);
  
  const { data: news } = useQuery<MarketNews>({
    queryKey: ['/api/news', selectedStock],
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: insight } = useQuery<StockInsight>({
    queryKey: ['/api/insights', selectedStock],
    enabled: !!selectedStock,
  });

  const clearChatMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/chat/history/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/history', userId] });
    },
  });

  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleStockSelect = (symbol: string) => {
    setSelectedStock(symbol);
    onStockChange(symbol);
    setSearchQuery("");
    setShowSuggestions(false);
  };

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

  const handleClearChat = () => {
    clearChatMutation.mutate();
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
    <div className="h-screen flex flex-col bg-primary">
      {/* Top Search Section */}
      <div className="p-6 border-b border-slate-700 bg-secondary">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="text-white w-5 h-5" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-1">StockGuru AI</h1>
              <p className="text-slate-400">AI-powered stock market analysis and insights</p>
            </div>
          </div>
          
          <div className="relative mt-6" onClick={e => e.stopPropagation()}>
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search stocks (e.g., RELIANCE, INFY, TCS, NIFTY...)"
              className="w-full bg-primary border-slate-600 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-400 focus:border-accent-blue text-lg"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            
            {showSuggestions && searchResults && Array.isArray(searchResults) && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-secondary border border-slate-600 rounded-xl mt-2 shadow-2xl z-50 max-h-60 overflow-y-auto">
                {searchResults.map((stock) => (
                  <button
                    key={stock.symbol}
                    className="w-full px-6 py-4 text-left hover:bg-primary transition-colors flex justify-between items-center"
                    onClick={() => handleStockSelect(stock.symbol)}
                  >
                    <div>
                      <div className="text-white font-medium">{stock.symbol}</div>
                      <div className="text-slate-400 text-sm">{stock.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Middle Output Section */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Left - Stock Data */}
          <div 
            className="flex-1 p-4 overflow-y-auto relative" 
            style={{ marginRight: `${chatWidth}px`, paddingBottom: '120px' }}
          >
            <div className="max-w-5xl mx-auto space-y-4">
              {/* Current Stock Info */}
              {quote && (
                <Card className="bg-secondary border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h2 className="text-xl font-bold text-white">{selectedStock}</h2>
                        <p className="text-slate-400 text-sm">{quote.companyName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">
                          ₹{quote.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                        <p className={cn(
                          "text-sm flex items-center justify-end mt-1",
                          (quote.change ?? 0) >= 0 ? "text-accent-green" : "text-accent-red"
                        )}>
                          <TrendingUp className={cn(
                            "w-4 h-4 mr-1",
                            (quote.change ?? 0) < 0 && "rotate-180"
                          )} />
                          {(quote.change ?? 0).toFixed(2)} ({(quote.changePercent ?? 0).toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Technical Indicators */}
              {indicators && (
                <Card className="bg-secondary border-slate-700">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Technical Analysis</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="text-center">
                        <p className="text-slate-400 text-xs">RSI (14)</p>
                        <p className="text-white font-bold text-lg">{(indicators.rsi ?? 0).toFixed(1)}</p>
                        <Badge className={cn(
                          "mt-1 text-xs",
                          (indicators.rsi ?? 0) > 70 ? "bg-accent-red/20 text-accent-red" :
                          (indicators.rsi ?? 0) < 30 ? "bg-accent-green/20 text-accent-green" :
                          "bg-yellow-500/20 text-yellow-400"
                        )}>
                          {(indicators.rsi ?? 0) > 70 ? "Overbought" : (indicators.rsi ?? 0) < 30 ? "Oversold" : "Neutral"}
                        </Badge>
                      </div>
                      <div className="text-center">
                        <p className="text-slate-400 text-sm">MACD</p>
                        <p className="text-white font-bold text-xl">{indicators.macd.toFixed(2)}</p>
                        <Badge className={cn(
                          "mt-1",
                          indicators.macd > 0 ? "bg-accent-green/20 text-accent-green" : "bg-accent-red/20 text-accent-red"
                        )}>
                          {indicators.macd > 0 ? "Bullish" : "Bearish"}
                        </Badge>
                      </div>
                      <div className="text-center">
                        <p className="text-slate-400 text-sm">SMA (20)</p>
                        <p className="text-white font-bold text-xl">₹{indicators.sma20.toFixed(2)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-slate-400 text-sm">EMA (50)</p>
                        <p className="text-white font-bold text-xl">₹{indicators.ema50.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Insights */}
              {insight && (
                <Card className="bg-secondary border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <Brain className="text-white text-sm" />
                        </div>
                        <h3 className="text-xl font-semibold text-white">AI Insights & Predictions</h3>
                      </div>
                      <Badge className="bg-purple-500/20 text-purple-400">{insight.prediction.confidence}% Confidence</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-primary rounded-lg">
                        <h4 className="text-white font-medium mb-2">Price Prediction</h4>
                        <p className={cn(
                          "text-2xl font-bold mb-1",
                          insight.prediction.direction === 'bullish' ? "text-accent-green" : "text-accent-red"
                        )}>
                          {insight.prediction.targetPrice ? `₹${insight.prediction.targetPrice.toFixed(2)}` : 'N/A'}
                        </p>
                        <p className={cn(
                          "text-sm font-medium",
                          insight.prediction.direction === 'bullish' ? "text-accent-green" : "text-accent-red"
                        )}>
                          {insight.prediction.direction.toUpperCase()}
                        </p>
                      </div>
                      
                      <div className="text-center p-4 bg-primary rounded-lg">
                        <h4 className="text-white font-medium mb-2">Risk Level</h4>
                        <Badge className={cn("text-lg p-2", getRiskColor(insight.riskLevel || 'medium'))}>
                          {(insight.riskLevel || 'medium').toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="text-center p-4 bg-primary rounded-lg">
                        <h4 className="text-white font-medium mb-2">Recommendation</h4>
                        <p className="text-white font-bold text-lg">
                          {insight.recommendation?.action?.toUpperCase() || 'ANALYZE'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Latest News */}
              {news && news.articles && Array.isArray(news.articles) && news.articles.length > 0 && (
                <Card className="bg-secondary border-slate-700">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Latest Market News</h3>
                    <div className="space-y-4">
                      {news.articles.slice(0, 3).map((article, index) => (
                        <div key={index} className="border-l-4 border-accent-blue pl-4">
                          <h4 className="text-white font-medium mb-2">{article.title}</h4>
                          <p className="text-slate-400 text-sm mb-2">{article.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 text-xs">{article.source.name}</span>
                            {article.sentiment && (
                              <Badge className={cn("text-xs", getSentimentColor(article.sentiment))}>
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
            </div>
          </div>

          {/* Resizer */}
          <div
            className="w-1 bg-slate-600 hover:bg-slate-500 cursor-col-resize flex-shrink-0 absolute right-0 top-0 bottom-0 z-10"
            onMouseDown={handleMouseDown}
            style={{ 
              cursor: isDragging ? 'col-resize' : 'col-resize',
              right: `${chatWidth}px`
            }}
          />

          {/* Right - Chat Panel */}
          <div 
            className="border-l border-slate-700 bg-secondary overflow-y-auto p-3 absolute right-0 top-0 bottom-0 z-0"
            style={{ width: `${chatWidth}px`, paddingBottom: '60px' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-sm">AI Chat</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                disabled={clearChatMutation.isPending}
                className="text-slate-400 hover:text-white h-6 w-6 p-1"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {historyLoading ? (
                <div className="text-center text-slate-400 py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue mx-auto mb-2"></div>
                  <p className="text-sm">Loading chat history...</p>
                </div>
              ) : (!chatHistory || chatHistory.length === 0) ? (
                <div className="text-center text-slate-400 py-8">
                  <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Start a conversation!</p>
                </div>
              ) : (
                (chatHistory || []).map((message) => (
                  <div key={message.id} className="space-y-2">
                    {/* User Message */}
                    <div className="flex items-start space-x-2 justify-end">
                      <div className="max-w-[80%] p-2 rounded-lg bg-accent-blue text-white text-xs">
                        <div className="whitespace-pre-wrap">{message.message}</div>
                      </div>
                      <div className="w-5 h-5 bg-accent-blue rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="text-white w-2 h-2" />
                      </div>
                    </div>
                    
                    {/* Assistant Response */}
                    {message.response && (
                      <div className="flex items-start space-x-2">
                        <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="text-white w-2 h-2" />
                        </div>
                        <div className="max-w-[80%] p-2 rounded-lg bg-primary text-slate-100 text-xs">
                          <div className="whitespace-pre-wrap">{message.response}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="text-white w-3 h-3" />
                  </div>
                  <div className="bg-primary p-3 rounded-lg text-sm">
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
          </div>
        </div>
      </div>

      {/* Bottom Chat Input Section - Moved inside chat panel */}
      <div 
        className="p-3 border-t border-slate-700 bg-secondary absolute bottom-0 left-0 z-20"
        style={{ right: `${chatWidth}px` }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Quick Suggestions */}
          <div className="flex flex-wrap gap-1 mb-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-6 px-2 border-slate-600 hover:bg-slate-700"
              onClick={() => handleSendMessage(`What's the outlook for ${selectedStock}?`)}
            >
              Analyze {selectedStock}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-6 px-2 border-slate-600 hover:bg-slate-700"
              onClick={() => handleSendMessage("What are the current NIFTY trends?")}
            >
              NIFTY Trends
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-6 px-2 border-slate-600 hover:bg-slate-700"
              onClick={() => handleSendMessage(`Get latest news about ${selectedStock}`)}
            >
              Latest News
            </Button>
          </div>
          
          {/* Input Area */}
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder={`Ask about ${selectedStock}, NIFTY, or market analysis...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-primary border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-accent-blue text-sm h-8"
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-accent-blue hover:bg-accent-blue/80 text-white px-3 py-1 rounded-lg h-8"
            >
              <Send className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      
    </div>
  );
}