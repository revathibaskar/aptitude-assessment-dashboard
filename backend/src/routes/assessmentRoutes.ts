import { Router } from 'express';
import { assessmentController } from '../controllers/assessmentController';
import { validateRequest } from '../middleware/validate';
import {
  startAssessmentSchema,
  submitAnswerSchema,
  markReviewSchema,
} from '../validators/schemas';

const router = Router();

router.get('/instructions', (req, res, next) => {
  assessmentController.getInstructions(req, res, next);
});

router.post('/start', validateRequest(startAssessmentSchema), (req, res, next) => {
  assessmentController.start(req, res, next);
});

router.get('/:attemptId', (req, res, next) => {
  assessmentController.getAssessment(req, res, next);
});

router.put('/:attemptId/answers', validateRequest(submitAnswerSchema), (req, res, next) => {
  assessmentController.saveAnswer(req, res, next);
});

router.post('/:attemptId/mark-review', validateRequest(markReviewSchema), (req, res, next) => {
  assessmentController.markForReview(req, res, next);
});

router.post('/:attemptId/submit', (req, res, next) => {
  assessmentController.submit(req, res, next);
});

export default router;
