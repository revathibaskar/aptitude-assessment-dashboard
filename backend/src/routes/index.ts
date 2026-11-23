import { Router } from 'express';
import candidateRoutes from './candidateRoutes';
import assessmentRoutes from './assessmentRoutes';
import resultRoutes from './resultRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.use('/candidates', candidateRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/results', resultRoutes);
router.use('/admin', adminRoutes);

export default router;
