import { HistoryRepository } from '../repositories/history.repository';
import { Conversation, Message, Memory, Feedback } from '../types/history';

export class HistoryService {
  private historyRepo = new HistoryRepository();

  public async getConversations(userNik?: string): Promise<Conversation[]> {
    return await this.historyRepo.getConversations(userNik);
  }

  public async getConversation(id: string): Promise<Conversation | undefined> {
    return await this.historyRepo.getConversationById(id);
  }

  public async startConversation(title: string, createdBy?: string): Promise<Conversation> {
    return await this.historyRepo.createConversation(title, createdBy);
  }

  public async removeConversation(id: string): Promise<void> {
    await this.historyRepo.deleteConversation(id);
  }

  public async togglePin(id: string): Promise<Conversation | null> {
    return await this.historyRepo.togglePinConversation(id);
  }

  public async getMessagesForConversation(conversationId: string): Promise<Message[]> {
    return await this.historyRepo.getMessages(conversationId);
  }

  public async saveMessage(
    conversationId: string,
    sender: 'User' | 'AI',
    text: string,
    sqlQuery?: string,
    sqlResult?: any,
    tokenUsage?: number
  ): Promise<Message> {
    return await this.historyRepo.addMessage(conversationId, sender, text, sqlQuery, sqlResult, tokenUsage);
  }

  // Memories
  public async getMemoriesForUser(conversationId?: string, userNik?: string): Promise<Memory[]> {
    return await this.historyRepo.getMemories(conversationId, userNik);
  }

  public async createMemory(factText: string, userNIK: string = 'VOK001', conversationId?: string): Promise<Memory> {
    return await this.historyRepo.addMemory(factText, userNIK, conversationId);
  }

  public async removeMemory(id: string): Promise<void> {
    await this.historyRepo.deleteMemory(id);
  }

  // Feedback
  public async saveFeedback(
    messageId: string,
    score: number,
    question: string,
    sqlQuery: string,
    answerText: string
  ): Promise<Feedback> {
    return await this.historyRepo.addFeedback(messageId, score, question, sqlQuery, answerText);
  }
}
