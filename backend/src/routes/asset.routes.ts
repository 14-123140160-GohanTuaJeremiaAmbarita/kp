import { Router } from 'express';
import { AssetController } from '../controllers/asset.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new AssetController();

router.get('/', authMiddleware, controller.getAll);
router.get('/:id', authMiddleware, controller.getById);

export default router;
