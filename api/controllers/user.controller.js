import productModel from '../../dao/models/products.model.js';
import UserRepository from '../repository/user.repository.js';
import UserDTO from '../dto/user.dto.js';
import bcrypt from 'bcrypt';

class UserController {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async registerUser(req, res) {
    const { first_name, last_name, email, age, password, Cart, role } = req.body;

    try {
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        return res.render('register', { error: 'El correo electrónico ya está registrado' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = {
        first_name,
        last_name,
        email,
        age,
        password: hashedPassword,
        cart: Cart,
        role,
      };

      await this.userRepository.create(newUser);
      req.session.userValidated = true;
      return res.render('registerSuccess');
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error al registrar el usuario' });
    }
  }

  async loginUser(req, res) {
    const { email, password } = req.body;

    try {
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        return res.render('login', { error: 'Usuario no encontrado' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.render('login', { error: 'Contraseña incorrecta' });
      }

      req.session.userValidated = true;
      req.session.userId = user._id;
      req.session.user = user;
      return res.redirect('/api/sessions/current');
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error en el inicio de sesión' });
    }
  }

  async getCurrentSession(req, res) {
    try {
      if (!req.session.userValidated) {
        return res.redirect('/login');
      }

      const user = await this.userRepository.findById(req.session.userId);

      if (!user || !Array.isArray(user.products)) {
        return res.render('products', { response: { error: 'No se encontraron productos asociados al usuario' } });
      }

      const productIds = user.products;

      const products = await productModel.find({ _id: { $in: productIds } }).exec();

      return res.render('products', { response: { products } });
    } catch (error) {
      console.error(error);
      return res.render('products', { response: { error: 'Error al obtener los productos' } });
    }
  }


async getCurrentUser(req, res) {
  try {
    if (!req.session.userValidated) {
      return res.redirect('/login');
    }

    const user = await this.userRepository.findById(req.session.userId);

    if (!user || !Array.isArray(user.products)) {
      return res.render('products', { response: { error: 'No se encontraron productos asociados al usuario' } });
    }

    const productIds = user.products;

    const products = await productModel.find({ _id: { $in: productIds } }).exec();

    return res.render('products', { response: { products } });
  } catch (error) {
    console.error(error);
    return res.render('products', { response: { error: 'Error al obtener los productos' } });
  }
}
}
export default UserController;
