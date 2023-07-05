import express from 'express';
import ProductController from '../controllers/product.controller.js';

const productRouter = express.Router();
const productController = new ProductController();

productRouter.get('/', productController.getProducts.bind(productController));
productRouter.get('/products', productController.getAllProducts.bind(productController));
productRouter.get('/realtimeproducts', productController.getRealtimeProducts.bind(productController));
productRouter.post('/api/products', productController.createProduct.bind(productController));
productRouter.get('/api/products', productController.getFilteredProducts.bind(productController));
productRouter.get('/api/products/:pid', productController.getProductById.bind(productController));
productRouter.put('/api/products/:pid', productController.updateProduct.bind(productController));
productRouter.delete('/api/products/:pid', productController.deleteProduct.bind(productController));

export default productRouter;