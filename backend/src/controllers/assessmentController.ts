import { Request, Response, NextFunction } from 'express';
import { assessmentService } from '../services/assessmentService';

export class AssessmentController {
  async getInstructions(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await assessmentService.getInstructions();
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async start(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { candidateId } = req.body;
      const data = await assessmentService.startAssessment(candidateId);
      res.status(200).json({
        success: true,
        message: 'Assessment session initialized.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAssessment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { attemptId } = req.params;
      const data = await assessmentService.getAssessment(attemptId);
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async saveAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { attemptId } = req.params;
      const { questionOrderIndex, selectedOption } = req.body;
      const data = await assessmentService.saveAnswer(attemptId, questionOrderIndex, selectedOption);
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async markForReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { attemptId } = req.params;
      const { questionOrderIndex, isMarkedForReview } = req.body;
      const data = await assessmentService.markForReview(attemptId, questionOrderIndex, isMarkedForReview);
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { attemptId } = req.params;
      const data = await assessmentService.submitAssessment(attemptId);
      res.json({
        success: true,
        message: 'Assessment submitted successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getResult(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { attemptId } = req.params;
      const data = await assessmentService.getResult(attemptId);
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const assessmentController = new AssessmentController();

