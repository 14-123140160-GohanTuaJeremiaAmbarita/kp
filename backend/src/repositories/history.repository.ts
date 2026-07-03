import { getHistoryDbInstance } from '../config/history.database';
import { Conversation, Message, Feedback, Memory } from '../types/history';

export class HistoryRepository {
  private db = getHistoryDbInstance();

  // Conversations
  public async getConversations(userNik?: string): Promise<Conversation[]> {
    return await this.db.getConversations(userNik);
  }

  public async getConversationById(id: string): Promise<Conversation | undefined> {
    const list = await this.db.getConversations();
    return list.find(c => c.ConversationID === id);
  }

  public async createConversation(title: string, createdBy?: string): Promise<Conversation> {
    return await this.db.addConversation(title, createdBy);
  }

  public async deleteConversation(id: string): Promise<void> {
    await this.db.deleteConversation(id);
  }

  public async togglePinConversation(id: string): Promise<Conversation | null> {
    return await this.db.togglePinConversation(id);
  }

  // Messages
  public async getMessages(conversationId: string): Promise<Message[]> {
    return await this.db.getMessages(conversationId);
  }

  public async addMessage(
    conversationId: string,
    sender: 'User' | 'AI',
    text: string,
    sqlQuery?: string,
    sqlResult?: any,
    tokenUsage?: number
  ): Promise<Message> {
    return await this.db.addMessage(conversationId, sender, text, sqlQuery, sqlResult, tokenUsage);
  }

  // Feedback & Learning Loop
  public async addFeedback(
    messageId: string,
    score: number,
    question: string,
    sqlQuery: string,
    answerText: string
  ): Promise<Feedback> {
    return await this.db.addFeedback(messageId, score, question, sqlQuery, answerText);
  }

  public async getLearnedWords(): Promise<Record<string, string>> {
    return await this.db.getLearnedWords();
  }

  public async addLearnedWord(word: string, sql: string): Promise<void> {
    await this.db.addLearnedWord(word, sql);
  }

  // AI Memories
  public async getMemories(conversationId?: string, userNik?: string): Promise<Memory[]> {
    return await this.db.getMemories(conversationId, userNik);
  }

  public async addMemory(factText: string, userNIK: string = 'VOK001', conversationId?: string): Promise<Memory> {
    return await this.db.addMemory(factText, userNIK, conversationId);
  }

  public async deleteMemory(id: string): Promise<void> {
    await this.db.deleteMemory(id);
  }

  // Raw SQL execution simulator
  public async executeSQL(sql: string) {
    return await this.db.executeSQL(sql);
  }

  // Dashboard Stats simulator
  public async getDashboardStats() {
    return await this.db.getDashboardStats();
  }
}
