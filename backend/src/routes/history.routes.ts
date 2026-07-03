import { Router } from 'express';
import { HistoryController } from '../controllers/history.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new HistoryController();

// Conversations
router.get('/conversations', authMiddleware, controller.getConversations);
router.post('/conversations', authMiddleware, controller.createConversation);
router.delete('/conversations/:id', authMiddleware, controller.deleteConversation);
router.post('/conversations/:id/pin', authMiddleware, controller.pinConversation);
router.get('/conversations/:id/messages', authMiddleware, controller.getMessages);

// Memories
router.get('/memories', authMiddleware, controller.getMemories);
router.post('/memories', authMiddleware, controller.createMemory);
router.delete('/memories/:id', authMiddleware, controller.deleteMemory);

export default router;
