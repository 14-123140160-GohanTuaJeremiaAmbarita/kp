import { Router } from 'express';
import { ExportController } from '../controllers/export.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new ExportController();

router.post('/', authMiddleware, controller.exportData);

export default router;
