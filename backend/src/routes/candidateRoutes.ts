import { Router } from 'express';
import { candidateController } from '../controllers/candidateController';
import { validateRequest } from '../middleware/validate';
import { candidateRegisterSchema } from '../validators/schemas';

const router = Router();

router.post('/register', validateRequest(candidateRegisterSchema), (req, res, next) => {
  candidateController.register(req, res, next);
});

export default router;

