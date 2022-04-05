import express from 'express';
import userRoutes from './user.route';
import authRoutes from './auth.route';
import tablesRoutes from './tables.route';
import reservationsRoute from "./reservations.route";

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) => res.send('OK'));

router.use('/tables', tablesRoutes);

router.use('/users', userRoutes);

router.use('/auth', authRoutes);

router.use('/reservations', reservationsRoute);

export default router;
