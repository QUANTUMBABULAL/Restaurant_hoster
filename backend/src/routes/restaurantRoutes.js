import { Router } from 'express';
import { getDashboardStats, updateRestaurant } from '../controllers/restaurantController.js';
import { authenticate, requireRestaurant } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

router.use(authenticate, requireRestaurant);

router.get('/dashboard', getDashboardStats);
router.put('/settings', upload.single('logo'), updateRestaurant);

export default router;
