import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new DashboardController();

router.get('/', authMiddleware, controller.getStats);

export default router;
