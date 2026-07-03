import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new AuthController();

router.post('/login', controller.login);
router.post('/register', controller.register);
router.get('/me', authMiddleware, controller.getCurrentSession);
router.delete('/users/:username', authMiddleware, controller.deleteUser);

export default router;
