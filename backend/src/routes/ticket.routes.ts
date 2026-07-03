import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new TicketController();

router.get('/', authMiddleware, controller.getAll);
router.get('/:id', authMiddleware, controller.getById);

export default router;
