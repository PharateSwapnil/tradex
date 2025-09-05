import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { NewsArticle } from "@/types/stock";

interface MarketNews {
  articles: NewsArticle[];
  lastUpdated: string;
}

export default function NewsAndAlerts() {
  const { data: news, isLoading } = useQuery<MarketNews>({
    queryKey: ['/api/news'],
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  if (isLoading) {
    return (
      <Card className="bg-secondary border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Latest News & Alerts</h3>
            <Button variant="ghost" size="icon">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border-l-2 border-slate-600 pl-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-3/4 mb-2" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-16" />
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
          <h3 className="text-lg font-semibold text-white">Latest News & Alerts</h3>
          <Button variant="ghost" size="icon" className="text-accent-blue hover:text-accent-blue/80">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          {news && news.articles.length > 0 ? (
            news.articles.slice(0, 3).map((article, index) => {
              const sentimentColor = getSentimentColor(article.sentiment?.sentiment);
              const borderColor = article.sentiment?.sentiment === 'positive' 
                ? 'border-accent-green' 
                : article.sentiment?.sentiment === 'negative'
                ? 'border-accent-red'
                : 'border-accent-blue';

              return (
                <div key={index} className={cn("border-l-2 pl-4", borderColor)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm mb-1 line-clamp-2">
                        {article.title}
                      </h4>
                      <p className="text-slate-400 text-xs mb-2 line-clamp-2">
                        {article.summary}
                      </p>
                      <div className="flex items-center space-x-2 text-xs flex-wrap gap-1">
                        <span className="text-slate-500">{article.source}</span>
                        <span className="text-slate-500">•</span>
                        <div className="flex items-center text-slate-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTimeAgo(article.publishedAt)}
                        </div>
                        {article.sentiment && (
                          <Badge variant="outline" className={cn("text-xs", sentimentColor)}>
                            {article.sentiment.sentiment}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p>No recent news available</p>
              <p className="text-sm mt-2">Check back later for market updates</p>
            </div>
          )}
        </div>

        {news && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-400">
              Last updated: {new Date(news.lastUpdated).toLocaleTimeString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
