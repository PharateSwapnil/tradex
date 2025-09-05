import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, ArrowUp, Heart } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { WatchlistItem } from "@/types/stock";

interface WatchlistProps {
  userId: string;
  onStockSelect: (symbol: string) => void;
}

export default function Watchlist({ userId, onStockSelect }: WatchlistProps) {
  const queryClient = useQueryClient();
  
  const { data: watchlist, isLoading } = useQuery<WatchlistItem[]>({
    queryKey: ['/api/watchlist', userId],
    enabled: !!userId,
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: async (symbol: string) => {
      await apiRequest('DELETE', `/api/watchlist/${userId}/${symbol}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist', userId] });
    },
  });

  const handleStockClick = (symbol: string) => {
    onStockSelect(symbol);
  };

  const handleRemoveFromWatchlist = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromWatchlistMutation.mutate(symbol);
  };

  if (isLoading) {
    return (
      <Card className="bg-secondary border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">My Watchlist</h3>
            <Button variant="ghost" size="icon">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-12 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-secondary border-slate-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">My Watchlist</h3>
          <Button variant="ghost" size="icon" className="text-accent-blue hover:text-accent-blue/80">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-3">
          {watchlist && watchlist.length > 0 ? (
            watchlist.map((item) => {
              const quote = item.quote;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-primary transition-colors cursor-pointer group"
                  onClick={() => handleStockClick(item.symbol)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {item.symbol.slice(0, 3)}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{item.symbol}</p>
                      <p className="text-slate-400 text-sm">{item.companyName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      {quote ? (
                        <>
                          <p className="text-white font-medium">
                            ₹{quote.price.toFixed(2)}
                          </p>
                          <p className={cn(
                            "text-sm flex items-center",
                            quote.change >= 0 ? "text-accent-green" : "text-accent-red"
                          )}>
                            {quote.change >= 0 ? (
                              <ArrowUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingUp className="w-3 h-3 mr-1 rotate-180" />
                            )}
                            ₹{Math.abs(quote.change).toFixed(2)} ({Math.abs(quote.changePercent).toFixed(2)}%)
                          </p>
                        </>
                      ) : (
                        <p className="text-slate-400 text-sm">Loading...</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 text-accent-red hover:text-accent-red/80 transition-opacity"
                      onClick={(e) => handleRemoveFromWatchlist(item.symbol, e)}
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Your watchlist is empty</p>
              <p className="text-sm mt-2">Add stocks to track your favorites</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
