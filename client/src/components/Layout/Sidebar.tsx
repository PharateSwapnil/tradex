import { Home, Search, BarChart3, Newspaper, Heart, Bell, Bot, TrendingUp, ChevronLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Dashboard", active: true },
  { icon: Search, label: "Stock Explorer" },
  { icon: BarChart3, label: "Technical Analysis" },
  { icon: Newspaper, label: "News & Sentiment" },
  { icon: Heart, label: "Watchlist" },
  { icon: Bell, label: "Alerts" },
  { icon: Bot, label: "AI Assistant" },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  return (
    <aside className={cn(
      "bg-secondary border-r border-slate-700 flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className={cn("p-6 border-b border-slate-700", collapsed && "p-3")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-accent-green to-accent-blue rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white text-sm" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-xl font-bold text-white">StockGuru</h1>
                <p className="text-slate-400 text-sm">AI-Powered Stock Analysis</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggle?.(!collapsed)}
            className="text-slate-400 hover:text-white h-8 w-8"
          >
            {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      
      <nav className={cn("flex-1 p-4", collapsed && "p-2")}>
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <a
                  href="#"
                  className={cn(
                    "flex items-center rounded-lg transition-colors",
                    collapsed ? "justify-center p-2" : "space-x-3 px-3 py-2",
                    item.active
                      ? "bg-accent-blue/20 text-accent-blue border border-accent-blue/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-700"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className={item.active ? "font-medium" : ""}>{item.label}</span>}
                </a>
              </li>
            );
          })}
        </ul>
        
        {!collapsed && (
          <div className="mt-8 pt-4 border-t border-slate-700">
            <p className="text-slate-500 text-xs uppercase tracking-wide font-semibold mb-3">
              Market Status
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Market</span>
                <span className="px-2 py-1 bg-accent-green/20 text-accent-green rounded text-xs font-medium">
                  Open
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Time</span>
                <span className="text-white">
                  {new Date().toLocaleTimeString('en-IN', { 
                    timeZone: 'Asia/Kolkata',
                    hour12: true,
                    hour: 'numeric',
                    minute: '2-digit'
                  })} IST
                </span>
              </div>
            </div>
          </div>
        )}
      </nav>
      
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">JD</span>
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-medium">John Doe</p>
            <p className="text-slate-400 text-xs">Premium User</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
