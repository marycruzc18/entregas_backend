import  fs  from 'fs'
import {Router} from 'express'
import { __dirname } from '../../utils.js';
import productModel from '../../dao/models/products.model.js'
import cartsModel from '../../dao/models/carts.model.js'
import UserModel from '../../dao/models/user.model.js';





const ArchivoCarritos = './carrito.json';

const  ArchivoProductos= './productos.json'

let productos=[];

let carritos=[];



const productRoutes = (io)  => {

const router  = Router()

router.get('/', async (req, res) => {
  try {
    if (req.session.userValidated) {
      // El usuario está autenticado, obtener los productos asociados a ese usuario
      const user = await UserModel.findById(req.session.userId).exec();

      if (user) {
        const products = await productModel.find({ _id: { $in: user.products } }).exec();

        // Renderizar la página de productos con los datos correspondientes
        return res.render('products', { response: { products } });
      }
    }

    // El usuario no está autenticado o no tiene productos asociados
    // Renderizar la página de inicio de sesión
    res.render('login');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los productos' });
  }
});


router.get('/products', async (req, res) => {
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
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener los productos');
  }
});

  
  
  
  router.get('/realtimeproducts', async(req, res) => {
    const datos = await fs.promises.readFile(ArchivoProductos,'utf-8' );
    const products= JSON.parse(datos);
   
    res.render('realTimeProducts', {products})
   
  });
  
  
  router.post('/api/products', async (req, res) => {
    try {
      const product = req.body;
      const newProduct = await productModel.create(product);
      res.status(201).send({ mensaje: 'Producto creado exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).send({ mensaje: 'Error al crear el producto' });
    }
  });
  
  
  
  
  router.get('/api/products', async (req, res) => {
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
    });


    router.get('/api/products/:pid', async (req, res) => {
      try {
        const product = await productModel.findById(req.params.pid);
        if (product) {
          res.status(200).send(product);
        } else {
          res.status(404).send({ mensaje: 'ERROR: No hay producto con ese id, no existe' });
        }
      } catch (error) {
        console.error(error);
        res.status(500).send({ mensaje: 'Error al buscar el producto' });
      }
    });
    
  
    router.put('/api/products/:pid', async (req, res) => {
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
    });
    
  
  
  
  router.delete('/api/products/:pid', async (req, res) => {
  
    try {
      const deletedProduct = await productModel.findByIdAndDelete(req.params.pid);
      if (deletedProduct) {
        res.status(200).send({ mensaje: "Producto eliminado" });
      } else {
        res.status(404).send({ mensaje: "No se encontró el producto" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ mensaje: "Error al eliminar el producto" });
    }
  });
  
  fs.readFile(ArchivoCarritos, 'utf-8', (err, data) => {
    if (!err) {
      carritos = JSON.parse(data);
    }
  });
  
  router.post('/api/carts', async (req, res) => {
    try {
      const newCart = new cartsModel({
        products: []
      });
  
      await newCart.save();
  
      res.send(`Carrito creado exitosamente con ID: ${newCart._id}`);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al crear el carrito');
    }
  });

  
  
  router.post('/api/carts/:idcart/products/:pid', async (req, res) => {
    try {
      const cartId = req.params.idcart;
      const productId = req.params.pid;
  
      const cart = await cartsModel.findById(cartId);
      if (!cart) {
        res.status(404).send('Carrito no encontrado');
        return;
      }
  
      const product = await productModel.findById(productId);
      if (!product) {
        res.status(404).send('Producto no encontrado');
        return;
      }
  
      cart.products.push(product);
      await cart.save();
  
      res.send('Producto agregado al carrito exitosamente');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al agregar el producto al carrito');
    }
  });

  router.delete('/api/carts/:cid/products/:pid', async (req, res) => {
    try {
      const cartId = req.params.cid;
      const productId = req.params.pid;
  
      const cart = await cartsModel.findById(cartId);
      if (!cart) {
        res.status(404).json({ mensaje: 'Carrito no encontrado' });
        return;
      }
  
      const productIndex = cart.products.findIndex((product) => product._id.toString() === productId);
      if (productIndex === -1) {
        res.status(404).json({ mensaje: 'Producto no encontrado en el carrito' });
        return;
      }
  
      cart.products.splice(productIndex, 1);
      await cart.save();
  
      res.json({ mensaje: 'Producto eliminado del carrito exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', error: 'Error al eliminar el producto del carrito' });
    }
  });
  
  router.put('/api/carts/:cid', async (req, res) => {
    try {
      const cartId = req.params.cid;
      const { products } = req.body;
  
      const cart = await cartsModel.findById(cartId);
      if (!cart) {
        res.status(404).json({ mensaje: 'Carrito no encontrado' });
        return;
      }
  
      cart.products = products;
      await cart.save();
  
      res.json({ mensaje: 'Carrito actualizado exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', error: 'Error al actualizar el carrito' });
    }
  });
  
  router.put('/api/carts/:cid/products/:pid', async (req, res) => {
    try {
      const cartId = req.params.cid;
      const productId = req.params.pid;
      const { quantity } = req.body;
  
      const cart = await cartsModel.findById(cartId);
      if (!cart) {
        res.status(404).json({ mensaje: 'Carrito no encontrado' });
        return;
      }
  
      const productIndex = cart.products.findIndex((product) => product._id.toString() === productId);
      if (productIndex === -1) {
        res.status(404).json({ mensaje: 'Producto no encontrado en el carrito' });
        return;
      }
  
      cart.products[productIndex].quantity = quantity;
      await cart.save();
  
      res.json({ mensaje: 'Cantidad del producto actualizada exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', error: 'Error al actualizar la cantidad del producto en el carrito' });
    }
  });
  
  router.delete('/api/carts/:cid', async (req, res) => {
    try {
      const cartId = req.params.cid;
  
      const cart = await cartsModel.findByIdAndDelete(cartId);
      if (!cart) {
        res.status(404).json({ mensaje: 'Carrito no encontrado' });
        return;
      }
  
      res.json({ mensaje: 'Carrito eliminado exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', error: 'Error al eliminar el carrito' });
    }
  });
  

  router.get('/carts/:cid', async (req, res) => {
    try {
      const cartId = req.params.cid;
  
      const cart = await cartsModel.findById(cartId).populate('products').lean();
  
      if (!cart) {
        return res.status(404).send('Carrito no encontrado');
      }
  
      res.render('cart', {
        cart: cart,
        products: cart.products
      });
    } catch (error) {
      console.log(error);
      res.status(500).send('Error al obtener el carrito');
    }
  });
  





  
  return router;
  
}







export default productRoutes;