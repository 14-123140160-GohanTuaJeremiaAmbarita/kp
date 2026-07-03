import { Router } from 'express';
import { WorkOrderController } from '../controllers/workorder.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new WorkOrderController();

router.get('/', authMiddleware, controller.getAll);
router.get('/:id', authMiddleware, controller.getById);

export default router;
