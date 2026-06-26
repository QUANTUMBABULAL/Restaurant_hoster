import { Router } from 'express';
import { getRestaurantBySlug } from '../controllers/restaurantController.js';
import { getPublicCategories } from '../controllers/categoryController.js';
import { getPublicMenu } from '../controllers/menuController.js';
import { getPublicOffers } from '../controllers/offerController.js';
import { validateTable } from '../controllers/tableController.js';
import { placeOrder, getPublicOrder } from '../controllers/orderController.js';
import { resolveRestaurant } from '../middlewares/restaurantResolver.js';

const router = Router();

router.get('/restaurant/:slug', getRestaurantBySlug);
router.get('/restaurant/:slug/categories', resolveRestaurant, getPublicCategories);
router.get('/restaurant/:slug/menu', resolveRestaurant, getPublicMenu);
router.get('/restaurant/:slug/offers', resolveRestaurant, getPublicOffers);
router.get('/restaurant/:slug/table/:tableNumber', validateTable);
router.post('/orders', placeOrder);
router.get('/orders/:id', getPublicOrder);

export default router;
