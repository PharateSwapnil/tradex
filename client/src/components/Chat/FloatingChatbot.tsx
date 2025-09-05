import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Bot, MessageCircle } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface FloatingChatbotProps {
  userId?: string;
}

const suggestionQuickActions = [
  "NIFTY trends",
  "TCS analysis", 
  "Portfolio tips",
  "Market sentiment"
];

export default function FloatingChatbot({ userId }: FloatingChatbotProps) {
  const [inputMessage, setInputMessage] = useState("");
  const { 
    isOpen, 
    toggleChat, 
    chatHistory, 
    sendMessage, 
    isLoading, 
    historyLoading 
  } = useChat(userId);

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

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[480px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-secondary border border-slate-700 rounded-xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-2 duration-300">
          <div className="p-5 border-b border-slate-700 flex items-center justify-between bg-gradient-to-r from-slate-800/50 to-slate-700/50">
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
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleChat}
              className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-gradient-to-b from-slate-900/20 to-slate-800/20">
            {historyLoading ? (
              <div className="text-center text-slate-400 py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue mx-auto mb-2"></div>
                Loading chat history...
              </div>
            ) : chatHistory.length === 0 ? (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Bot className="text-white w-4 h-4" />
                </div>
                <div className="bg-gradient-to-r from-primary to-slate-700 p-4 rounded-xl flex-1 shadow-lg border border-slate-600/50">
                  <p className="text-white text-sm leading-relaxed">
                    👋 Hello! I'm <strong>StockGuru AI</strong>, your Indian stock market assistant. 
                  </p>
                  <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                    Ask me about any NSE/BSE stock, technical analysis, or market trends. Try:
                  </p>
                  <ul className="text-accent-blue text-xs mt-2 space-y-1">
                    <li>• "What's the RSI of RELIANCE?"</li>
                    <li>• "Show me NIFTY 50 trends"</li>
                    <li>• "Analyze TCS fundamentals"</li>
                  </ul>
                </div>
              </div>
            ) : (
              chatHistory.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-r from-accent-blue to-blue-600 p-3 rounded-xl max-w-sm shadow-lg">
                      <p className="text-white text-sm font-medium">{msg.message}</p>
                    </div>
                  </div>
                  
                  {/* AI response */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Bot className="text-white w-4 h-4" />
                    </div>
                    <div className="bg-gradient-to-r from-primary to-slate-700 p-3 rounded-xl flex-1 shadow-lg border border-slate-600/50">
                      <p className="text-white text-sm leading-relaxed">{msg.response}</p>
                      {msg.actionType && (
                        <Badge 
                          variant="outline" 
                          className="mt-2 text-xs bg-accent-blue/20 text-accent-blue border-accent-blue/30 px-2 py-1"
                        >
                          {msg.actionType.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Bot className="text-white w-4 h-4" />
                </div>
                <div className="bg-gradient-to-r from-primary to-slate-700 p-3 rounded-xl flex-1 shadow-lg border border-slate-600/50">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-accent-blue rounded-full animate-pulse"></div>
                      <div className="w-3 h-3 bg-accent-blue rounded-full animate-pulse delay-100"></div>
                      <div className="w-3 h-3 bg-accent-blue rounded-full animate-pulse delay-200"></div>
                    </div>
                    <span className="text-slate-400 text-xs">StockGuru is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-5 border-t border-slate-700 bg-gradient-to-r from-slate-800/30 to-slate-700/30">
            <div className="flex space-x-3">
              <Input
                type="text"
                placeholder="Ask about stocks, technical analysis, market trends..."
                className="flex-1 bg-primary border-2 border-slate-600 rounded-xl text-white placeholder-slate-400 text-sm focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 px-4 py-3"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <Button 
                className="bg-gradient-to-r from-accent-blue to-blue-600 hover:from-accent-blue/80 hover:to-blue-600/80 px-4 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputMessage.trim()}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {suggestionQuickActions.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="ghost"
                  size="sm"
                  className="px-3 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-sm hover:bg-accent-blue/20 hover:text-accent-blue border border-slate-600/50 transition-all duration-200"
                  onClick={() => handleSendMessage(suggestion)}
                  disabled={isLoading}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Chat Toggle Button */}
      <Button
        onClick={toggleChat}
        className={cn(
          "w-16 h-16 bg-gradient-to-r from-accent-blue to-purple-500 rounded-full shadow-xl flex items-center justify-center text-white hover:scale-105 transition-all duration-300",
          isOpen && "bg-gradient-to-r from-slate-600 to-slate-700 rotate-90"
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </Button>
    </div>
  );
}
