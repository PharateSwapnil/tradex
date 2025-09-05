import { useState } from "react";
import StockSearchChatbot from "@/components/Chat/StockSearchChatbot";

export default function Dashboard() {
  const [selectedStock, setSelectedStock] = useState("RELIANCE");
  const [userId] = useState("demo-user"); // In a real app, this would come from auth

  return (
    <div className="min-h-screen bg-primary text-slate-100">
      <StockSearchChatbot 
        userId={userId} 
        initialStock={selectedStock}
        onStockChange={setSelectedStock}
      />
    </div>
  );
}
