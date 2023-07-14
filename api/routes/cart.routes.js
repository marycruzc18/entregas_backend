import express from 'express';
import CartController from '../controllers/cart.controller.js';

const router = express.Router();
const cartController = new CartController();

router.post('/api/carts', cartController.createCart);
router.post('/api/carts/:idcart/products/:pid', authorize(['user']), cartController.addProductToCart.bind(cartController));
router.delete('/api/carts/:cid/products/:pid', cartController.removeProductFromCart);
router.put('/api/carts/:cid', cartController.updateCart);
router.put('/api/carts/:cid/products/:pid', cartController.updateProductQuantity);
router.delete('/api/carts/:cid', cartController.deleteCart);
router.get('/carts/:cid', cartController.getCart);
router.post('/api/carts/:cid/purchase', cartController.purchaseCart);


export default router;
