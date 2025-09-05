import { 
  type User, 
  type InsertUser, 
  type WatchlistItem, 
  type InsertWatchlistItem,
  type StockAlert,
  type InsertStockAlert,
  type ChatMessage,
  type InsertChatMessage
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Watchlist management
  getUserWatchlist(userId: string): Promise<WatchlistItem[]>;
  addToWatchlist(item: InsertWatchlistItem): Promise<WatchlistItem>;
  removeFromWatchlist(userId: string, symbol: string): Promise<boolean>;

  // Alerts management
  getUserAlerts(userId: string): Promise<StockAlert[]>;
  createAlert(alert: InsertStockAlert): Promise<StockAlert>;
  updateAlert(id: string, updates: Partial<StockAlert>): Promise<StockAlert | undefined>;
  deleteAlert(id: string): Promise<boolean>;

  // Chat history
  getUserChatHistory(userId: string, limit?: number): Promise<ChatMessage[]>;
  saveChatMessage(message: InsertChatMessage & { response: string }): Promise<ChatMessage>;
  clearUserChatHistory(userId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private watchlistItems: Map<string, WatchlistItem>;
  private stockAlerts: Map<string, StockAlert>;
  private chatMessages: Map<string, ChatMessage>;

  constructor() {
    this.users = new Map();
    this.watchlistItems = new Map();
    this.stockAlerts = new Map();
    this.chatMessages = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getUserWatchlist(userId: string): Promise<WatchlistItem[]> {
    return Array.from(this.watchlistItems.values()).filter(
      (item) => item.userId === userId
    );
  }

  async addToWatchlist(insertItem: InsertWatchlistItem): Promise<WatchlistItem> {
    const id = randomUUID();
    const item: WatchlistItem = {
      ...insertItem,
      id,
      addedAt: new Date()
    };
    this.watchlistItems.set(id, item);
    return item;
  }

  async removeFromWatchlist(userId: string, symbol: string): Promise<boolean> {
    const itemToRemove = Array.from(this.watchlistItems.entries()).find(
      ([, item]) => item.userId === userId && item.symbol === symbol
    );
    
    if (itemToRemove) {
      this.watchlistItems.delete(itemToRemove[0]);
      return true;
    }
    return false;
  }

  async getUserAlerts(userId: string): Promise<StockAlert[]> {
    return Array.from(this.stockAlerts.values()).filter(
      (alert) => alert.userId === userId && alert.isActive
    );
  }

  async createAlert(insertAlert: InsertStockAlert): Promise<StockAlert> {
    const id = randomUUID();
    const alert: StockAlert = {
      ...insertAlert,
      id,
      isActive: true,
      createdAt: new Date()
    };
    this.stockAlerts.set(id, alert);
    return alert;
  }

  async updateAlert(id: string, updates: Partial<StockAlert>): Promise<StockAlert | undefined> {
    const alert = this.stockAlerts.get(id);
    if (alert) {
      const updatedAlert = { ...alert, ...updates };
      this.stockAlerts.set(id, updatedAlert);
      return updatedAlert;
    }
    return undefined;
  }

  async deleteAlert(id: string): Promise<boolean> {
    return this.stockAlerts.delete(id);
  }

  async getUserChatHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    const userMessages = Array.from(this.chatMessages.values())
      .filter((msg) => msg.userId === userId)
      .sort((a, b) => b.timestamp!.getTime() - a.timestamp!.getTime())
      .slice(0, limit);
    return userMessages.reverse();
  }

  async saveChatMessage(insertMessage: InsertChatMessage & { response: string }): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = {
      ...insertMessage,
      userId: insertMessage.userId || null,
      id,
      timestamp: new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async clearUserChatHistory(userId: string): Promise<void> {
    const userMessages = Array.from(this.chatMessages.entries())
      .filter(([, message]) => message.userId === userId);
    
    for (const [id] of userMessages) {
      this.chatMessages.delete(id);
    }
  }
}

export const storage = new MemStorage();
