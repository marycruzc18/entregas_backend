import { Router } from 'express';
import User from '../../dao/models/user.model.js';
import productModel from '../../dao/models/products.model.js';

const router = Router();

router.get('/', (req, res) => {
  if (req.session.userValidated) {
    // El usuario está autenticado, renderizar la página de productos
    res.render('products');
  } else {
    // El usuario no está autenticado, renderizar la página de inicio de sesión
    res.render('login');
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password }).exec();

    if (user) {
      // Usuario válido, iniciar sesión

      // Obtener los productos asociados a ese usuario
      const products = await productModel.find({ _id: { $in: user.products } }).exec();

      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const totalPages = Math.ceil(products.length / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedProducts = products.slice(startIndex, endIndex);

      const pages = [];
      for (let i = 1; i <= totalPages; i++) {
        const pageItem = {
          number: i,
          numberPgBar: i,
          url: `/products?page=${i}`,
        };
        pages.push(pageItem);
      }

      res.render('products', {
        response: {
          products: paginatedProducts,
          totalPages,
          prevPage: page > 1 ? page - 1 : null,
          nextPage: page < totalPages ? page + 1 : null,
          page,
          hasPrevPage: page > 1,
          hasNextPage: page < totalPages,
          prevPageUrl: page > 1 ? `/products?page=${page - 1}` : null,
          nextPageUrl: page < totalPages ? `/products?page=${page + 1}` : null,
          pages,
        },
      });
    } else {
      // Usuario inválido, mostrar mensaje de error
      res.status(401).json({ message: 'Credenciales inválidas' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

router.get('/logout', (req, res) => {
  // Cerrar sesión, eliminar la marca de autenticación del usuario en la sesión
  req.session.userValidated = false;
  res.redirect('/');
});

export default router;
