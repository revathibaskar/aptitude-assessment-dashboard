import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { adminController } from '../controllers/adminController';
import { authenticateAdmin } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import {
  adminLoginSchema,
  questionCreateUpdateSchema,
  testSettingSchema,
} from '../validators/schemas';

const router = Router();

// Rate limiter for admin login: 10 attempts per 15 mins
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public auth routes
router.post('/login', loginLimiter, validateRequest(adminLoginSchema), (req, res, next) => {
  adminController.login(req, res, next);
});

router.post('/logout', (req, res) => {
  adminController.logout(req, res);
});

// Protected routes (require authenticateAdmin)
router.use(authenticateAdmin);

router.get('/me', (req, res) => {
  adminController.getMe(req, res);
});

router.get('/dashboard', (req, res, next) => {
  adminController.getDashboard(req, res, next);
});

// Questions CRUD
router.get('/questions', (req, res, next) => {
  adminController.getQuestions(req, res, next);
});

router.post('/questions', validateRequest(questionCreateUpdateSchema), (req, res, next) => {
  adminController.addQuestion(req, res, next);
});

router.put('/questions/:id', (req, res, next) => {
  adminController.updateQuestion(req, res, next);
});

router.delete('/questions/:id', (req, res, next) => {
  adminController.deleteQuestion(req, res, next);
});

// Candidates & Results
router.get('/candidates', (req, res, next) => {
  adminController.getCandidates(req, res, next);
});

router.get('/candidates/:id', (req, res, next) => {
  adminController.getCandidateDetail(req, res, next);
});

router.get('/results/export', (req, res, next) => {
  adminController.exportResults(req, res, next);
});

// Settings
router.get('/settings', (req, res, next) => {
  adminController.getSettings(req, res, next);
});

router.put('/settings', validateRequest(testSettingSchema), (req, res, next) => {
  adminController.updateSettings(req, res, next);
});

export default router;

