import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new EmployeeController();

router.get('/', authMiddleware, controller.getAll);
router.get('/:nik', authMiddleware, controller.getByNik);

export default router;
