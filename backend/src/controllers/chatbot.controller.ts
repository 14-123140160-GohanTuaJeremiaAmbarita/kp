import { Request, Response, NextFunction } from 'express';
import { ChatbotService } from '../services/chatbot.service';
import { HistoryService } from '../services/history.service';
import { LearningService } from '../services/learning.service';

export class ChatbotController {
  private chatbotService = new ChatbotService();
  private historyService = new HistoryService();
  private learningService = new LearningService();

  public chat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { conversationId, messageText, model } = req.body;
      if (!conversationId || !messageText) {
        return res.status(400).json({ success: false, error: 'conversationId and messageText are required.' });
      }

      const user = (req as any).user;
      const userNIK = user?.NIK || 'VOK001';

      const result = await this.chatbotService.processMessage(conversationId, messageText, model, userNIK);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public submitFeedback = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { messageId, score, question, sqlQuery, answerText } = req.body;
      const fb = await this.historyService.saveFeedback(messageId, score, question, sqlQuery, answerText);

      // Reinforce the SQL query if it was upvoted (score === 1)
      if (score === 1 && question && sqlQuery) {
        this.learningService.learnFromFeedback(question, sqlQuery);
      }

      res.json({ success: true, feedback: fb });
    } catch (error) {
      next(error);
    }
  };
}
