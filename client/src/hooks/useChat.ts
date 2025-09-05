import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: string;
  userId?: string;
  message: string;
  response: string;
  timestamp: Date;
  suggestions?: string[];
  actionType?: 'stock_query' | 'technical_analysis' | 'market_insight' | 'general';
}

export function useChat(userId?: string) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: chatHistory, isLoading: historyLoading } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat/history', userId],
    enabled: !!userId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/chat', {
        message,
        userId,
      });
      return response.json();
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['/api/chat/history', userId] });
      }
    },
  });

  const sendMessage = (message: string) => {
    return sendMessageMutation.mutateAsync(message);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return {
    isOpen,
    toggleChat,
    chatHistory: chatHistory || [],
    sendMessage,
    isLoading: sendMessageMutation.isPending,
    historyLoading,
  };
}
