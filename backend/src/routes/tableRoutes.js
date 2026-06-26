import { Router } from 'express';
import {
  getTables,
  createTable,
  updateTable,
  deleteTable,
  getTableQR,
  downloadTableQR,
} from '../controllers/tableController.js';
import { authenticate, requireRestaurant } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate, requireRestaurant);

router.get('/', getTables);
router.post('/', createTable);
router.put('/:id', updateTable);
router.delete('/:id', deleteTable);
router.get('/:id/qr', getTableQR);
router.get('/:id/qr/download', downloadTableQR);

export default router;
