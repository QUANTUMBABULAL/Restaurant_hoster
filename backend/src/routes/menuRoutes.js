import { Router } from 'express';
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menuController.js';
import { authenticate, requireRestaurant } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

router.use(authenticate, requireRestaurant);

router.get('/', getMenuItems);
router.post('/', upload.single('image'), createMenuItem);
router.put('/:id', upload.single('image'), updateMenuItem);
router.delete('/:id', deleteMenuItem);

export default router;
