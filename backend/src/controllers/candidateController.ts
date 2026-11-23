import { Request, Response, NextFunction } from 'express';
import { candidateService } from '../services/candidateService';

export class CandidateController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await candidateService.register(req.body);
      res.status(201).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const candidateController = new CandidateController();
