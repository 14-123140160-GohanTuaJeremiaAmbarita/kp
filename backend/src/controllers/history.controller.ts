import { Request, Response, NextFunction } from 'express';
import { HistoryService } from '../services/history.service';

export class HistoryController {
  private historyService = new HistoryService();

  // Conversations
  public getConversations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const list = await this.historyService.getConversations(user?.NIK);
      res.json({ success: true, conversations: list });
    } catch (error) {
      next(error);
    }
  };

  public createConversation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title } = req.body;
      const user = (req as any).user;
      const newConv = await this.historyService.startConversation(title || 'New Chat', user?.NIK);
      res.json({ success: true, conversation: newConv });
    } catch (error) {
      next(error);
    }
  };

  public deleteConversation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.historyService.removeConversation(id as string);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  public pinConversation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updated = await this.historyService.togglePin(id as string);
      res.json({ success: true, conversation: updated });
    } catch (error) {
      next(error);
    }
  };

  // Messages
  public getMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const list = await this.historyService.getMessagesForConversation(id as string);
      res.json({ success: true, messages: list });
    } catch (error) {
      next(error);
    }
  };

  // Memories
  public getMemories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const conversationId = req.query.conversationId as string;
      const user = (req as any).user;
      const list = await this.historyService.getMemoriesForUser(conversationId, user?.NIK);
      res.json({ success: true, memories: list });
    } catch (error) {
      next(error);
    }
  };

  public createMemory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { factText, conversationId } = req.body;
      const user = (req as any).user;
      if (!factText) {
        return res.status(400).json({ success: false, error: 'factText is required' });
      }
      const memory = await this.historyService.createMemory(factText, user?.NIK || 'VOK001', conversationId);
      res.json({ success: true, memory });
    } catch (error) {
      next(error);
    }
  };

  public deleteMemory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.historyService.removeMemory(id as string);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  };
}
