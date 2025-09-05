import { useState, useEffect } from "react";
import { Search, Bell, Settings, TrendingUp, ArrowUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMarketIndices, useStockSearch } from "@/hooks/useStockData";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onStockSelect: (symbol: string) => void;
}

export default function Header({ onStockSelect }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const { data: indices } = useMarketIndices();
  const { data: searchResults } = useStockSearch(searchQuery);

  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleStockSelect = (symbol: string) => {
    onStockSelect(symbol);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  return (
    <header className="bg-secondary border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md" onClick={e => e.stopPropagation()}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search stocks (e.g., RELIANCE, INFY, TCS...)"
              className="w-full bg-primary border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:border-accent-blue"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            
            {showSuggestions && searchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-secondary border border-slate-600 rounded-lg mt-1 shadow-lg z-50 max-h-60 overflow-y-auto">
                {searchResults.map((stock) => (
                  <button
                    key={stock.symbol}
                    className="w-full px-4 py-3 text-left hover:bg-primary transition-colors flex justify-between items-center"
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
          
          <div className="hidden lg:flex items-center space-x-6 text-sm">
            {indices?.slice(0, 2).map((index) => (
              <div key={index.symbol} className="flex items-center space-x-2">
                <span className="text-slate-400">{index.name}</span>
                <span className="text-white font-semibold">
                  {index.value.toLocaleString('en-IN', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                  })}
                </span>
                <span className={cn(
                  "text-xs flex items-center",
                  index.change >= 0 ? "text-accent-green" : "text-accent-red"
                )}>
                  {index.change >= 0 ? (
                    <ArrowUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingUp className="w-3 h-3 mr-1 rotate-180" />
                  )}
                  {Math.abs(index.change).toFixed(2)} ({Math.abs(index.changePercent).toFixed(2)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Removed notification and settings icons as requested */}
        </div>
      </div>
    </header>
  );
}
