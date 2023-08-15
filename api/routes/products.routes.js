import express from 'express';
import ProductController from '../controllers/product.controller.js';
import { authenticateUser, authorize } from '../Middleware/authMiddleware.js';

const productRouter = express.Router();
const productController = new ProductController();

productRouter.get('/', productController.getProducts.bind(productController));
productRouter.get('/products', productController.getAllProducts.bind(productController));
productRouter.get('/realtimeproducts', productController.getRealtimeProducts.bind(productController));
productRouter.post('/api/products', authorize(['admin']), productController.createProduct.bind(productController));
productRouter.get('/api/products', productController.getFilteredProducts.bind(productController));
productRouter.get('/api/products/:pid', productController.getProductById.bind(productController));
productRouter.put('/api/products/:pid', authorize(['admin']), productController.updateProduct.bind(productController));
productRouter.delete('/api/products/:pid', authorize(['admin']), productController.deleteProduct.bind(productController));

export default productRouter;