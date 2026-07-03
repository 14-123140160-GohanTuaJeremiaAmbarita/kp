import { Router } from 'express';
import { ChatbotController } from '../controllers/chatbot.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new ChatbotController();

router.post('/chat', authMiddleware, controller.chat);
router.post('/feedback', authMiddleware, controller.submitFeedback);

export default router;
