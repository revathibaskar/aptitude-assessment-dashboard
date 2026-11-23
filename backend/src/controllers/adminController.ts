import { Response, NextFunction } from 'express';
import { adminService } from '../services/adminService';
import { AuthenticatedRequest } from '../types';
import { ENV } from '../config/env';

export class AdminController {
  async login(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await adminService.login(email, password);

      // Set HTTP-only secure cookie
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production',
        sameSite: ENV.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        message: 'Login successful.',
        data: {
          admin: result.admin,
          token: result.token, // Also return in body for Authorization header flexibility
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(_req: AuthenticatedRequest, res: Response): Promise<void> {
    res.clearCookie('token', {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: ENV.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.json({
      success: true,
      message: 'Logged out successfully.',
    });
  }

  async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({
      success: true,
      data: req.admin,
    });
  }

  async getDashboard(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminService.getDashboardStats();
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getQuestions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, isActive, search } = req.query;
      const filter: any = {};
      if (category) filter.category = category as any;
      if (isActive !== undefined) filter.isActive = isActive === 'true';
      if (search) filter.search = String(search);

      const data = await adminService.getQuestions(filter);
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async addQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const question = await adminService.addQuestion(req.body);
      res.status(201).json({
        success: true,
        message: 'Question added successfully.',
        data: question,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const question = await adminService.updateQuestion(id, req.body);
      res.json({
        success: true,
        message: 'Question updated successfully.',
        data: question,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await adminService.deleteQuestion(id);
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCandidates(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(String(req.query.page)) : 1;
      const limit = req.query.limit ? parseInt(String(req.query.limit)) : 10;
      const search = req.query.search ? String(req.query.search) : undefined;
      const statusFilter = req.query.statusFilter as any;
      const sortBy = req.query.sortBy as any;
      const sortOrder = req.query.sortOrder as any;

      const data = await adminService.getCandidates({
        page,
        limit,
        search,
        statusFilter,
        sortBy,
        sortOrder,
      });

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCandidateDetail(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data = await adminService.getCandidateDetail(id);
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async exportResults(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search ? String(req.query.search) : undefined;
      const statusFilter = req.query.statusFilter as any;

      const csvContent = await adminService.exportResultsToCsv({ search, statusFilter });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="assessment-results-${Date.now()}.csv"`);
      res.status(200).send(csvContent);
    } catch (error) {
      next(error);
    }
  }

  async getSettings(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminService.getSettings();
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { durationMinutes, passPercentage } = req.body;
      const data = await adminService.updateSettings(durationMinutes, passPercentage);
      res.json({
        success: true,
        message: 'Settings updated successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
