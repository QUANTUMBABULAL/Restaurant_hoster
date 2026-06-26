import { Router } from 'express';
import {
  getOrders,
  getOrder,
  updateOrderStatus,
  getAnalytics,
} from '../controllers/orderController.js';
import { authenticate, requireRestaurant } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate, requireRestaurant);

router.get('/', getOrders);
router.get('/analytics', getAnalytics);
router.get('/:id', getOrder);
router.patch('/:id/status', updateOrderStatus);

export default router;
