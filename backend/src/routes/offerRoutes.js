import { Router } from 'express';
import { getOffers, createOffer, updateOffer, deleteOffer } from '../controllers/offerController.js';
import { authenticate, requireRestaurant } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate, requireRestaurant);

router.get('/', getOffers);
router.post('/', createOffer);
router.put('/:id', updateOffer);
router.delete('/:id', deleteOffer);

export default router;
