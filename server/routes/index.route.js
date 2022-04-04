import express from 'express';
import userRoutes from './user.route';
import authRoutes from './auth.route';
import tablesRoutes from './tables.route';

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) => res.send('OK'));

router.use('/tables', tablesRoutes);

router.use('/users', userRoutes);

router.use('/auth', authRoutes);

export default router;
