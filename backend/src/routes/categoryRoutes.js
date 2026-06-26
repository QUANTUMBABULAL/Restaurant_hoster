import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { authenticate, requireRestaurant } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate, requireRestaurant);

router.get('/', getCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;
