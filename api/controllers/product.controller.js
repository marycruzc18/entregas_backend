import fs from 'fs';
import { Router } from 'express';
import productModel from '../../dao/models/products.model.js';
import UserModel from '../../dao/models/user.model.js';
import { authenticateUser } from '../Middleware/authMiddleware.js'
import getErrorMessage from '../../api/errorHandler.js';


const ArchivoProductos = './productos.json';


class ProductController {
  constructor(io) {
    this.io = io;
    this.router = Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.get('/', this.getProducts.bind(this));
    this.router.get('/products', this.getAllProducts.bind(this));
    this.router.get('/realtimeproducts', this.getRealtimeProducts.bind(this));
    this.router.post('/api/products', authenticateUser, this.createProduct.bind(this));
    this.router.get('/api/products', this.getFilteredProducts.bind(this));
    this.router.get('/api/products/:pid', this.getProductById.bind(this));
    this.router.put('/api/products/:pid', this.updateProduct.bind(this));
    this.router.delete('/api/products/:pid', this.deleteProduct.bind(this));

  }

  async getProducts(req, res) {
    try {
      if (req.session.userValidated) {
        const user = await UserModel.findById(req.session.userId).exec();

        if (user) {
          const products = await productModel.find({ _id: { $in: user.products } }).exec();
          return res.render('products', { response: { products } });
        }
      }

      res.render('login');
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener los productos' });
    }
  }

  async getAllProducts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const result = await productModel.paginate({}, { page, limit });

      const products = result.docs.map((product) => product.toObject());

      const pages = [];
      for (let i = 1; i <= result.totalPages; i++) {
        const pageItem = {
          number: i,
          numberPgBar: i,
          url: `/products?page=${i}`,
        };
        pages.push(pageItem);
      }

      res.render('products', {
        response: {
          products,
          totalPages: result.totalPages,
          prevPage: result.prevPage,
          nextPage: result.nextPage,
          page: result.page,
          hasPrevPage: result.hasPrevPage,
          hasNextPage: result.hasNextPage,
          prevPageUrl: result.hasPrevPage ? `/products?page=${result.prevPage}` : null,
          nextPageUrl: result.hasNextPage ? `/products?page=${result.nextPage}` : null,
          pages,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al obtener los productos');
    }
  }

  async getRealtimeProducts(req, res) {
    try {
      const datos = await fs.promises.readFile(ArchivoProductos, 'utf-8');
      const products = JSON.parse(datos);

      res.render('realTimeProducts', { products });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al obtener los productos en tiempo real');
    }
  }

  async createProduct(req, res) {
    try {
      const product = req.body;
      console.log('Nuevo producto:', product);
      const newProduct = await productModel.create(product);
      console.log('Producto creado:', newProduct); // Agregar este console.log
      res.status(201).send({ mensaje: getErrorMessage('PRODUCT_CREATE_SUCCESSFULLY') });
    } catch (error) {
      console.error(error);
      res.status(500).send({ mensaje: getErrorMessage('ERROR_CREATING_THE_PRODUCT') });
    }
  }
  
  

  async getFilteredProducts(req, res) {
    try {
      const { limit = 10, page = 1, sort, category, availability } = req.query;

      const filter = {};
      if (category) {
        filter.category = category;
      }
      if (availability) {
        filter.availability = availability;
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: sort === 'asc' || sort === 'desc' ? { price: sort } : undefined,
      };
      const result = await productModel.paginate(filter, options);

      const response = {
        status: 'success',
        payload: result.docs,
        totalPages: result.totalPages,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink: result.hasPrevPage ? `/api/products?page=${result.prevPage}` : null,
        nextLink: result.hasNextPage ? `/api/products?page=${result.nextPage}` : null,
      };

      res.json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', error: 'Error al obtener los productos' });
    }
  }

  async updateProduct(req, res) {
    try {
      const updatedProduct = await productModel.findByIdAndUpdate(req.params.pid, req.body, { new: true });
      if (updatedProduct) {
        res.status(200).send({ mensaje: 'Producto actualizado' });
      } else {
        res.status(404).send({ mensaje: 'ERROR: No hay producto con ese id, no se puede actualizar' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ mensaje: 'Error al actualizar el producto' });
    }
  }

  async deleteProduct(req, res) {
    try {
      const deletedProduct = await productModel.findByIdAndDelete(req.params.pid);
      if (deletedProduct) {
        res.status(200).send({ mensaje: 'Producto eliminado' });
      } else {
        res.status(404).send({ mensaje: 'No se encontró el producto' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ mensaje: 'Error al eliminar el producto' });
    }
  }

  async getProductById(req, res) {
    try {
      const product = await productModel.findById(req.params.pid).exec();
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ mensaje: 'No se encontró el producto' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: 'Error al obtener el producto' });
    }
  }
}

export default ProductController;
