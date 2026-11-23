import { Router } from 'express';
import { assessmentController } from '../controllers/assessmentController';

const router = Router();

router.get('/:attemptId', (req, res, next) => {
  assessmentController.getResult(req, res, next);
});

export default router;

