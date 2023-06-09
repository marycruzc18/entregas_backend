import express from 'express';
import UserModel from '../../dao/models/user.model.js';
import productModel from '../../dao/models/products.model.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Formulario de registro de usuario
router.get('/register', (req, res) => {
  res.render('register');
});

// Registro de usuario
router.post('/register', async (req, res) => {
  const { first_name, last_name, email, age, password } = req.body;

  try {
    // Verificar si ya existe un usuario con el mismo correo electrónico
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.render('register', { error: 'El correo electrónico ya está registrado' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      first_name,
      last_name,
      email,
      age,
      password: hashedPassword, // Usar la contraseña encriptada
    });

    await newUser.save();

    // Redireccionar a la página de confirmación
    return res.render('registerSuccess');
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al registrar el usuario' });
  }
});

// Formulario de inicio de sesión
router.get('/login', (req, res) => {
  res.render('login');
});

// Inicio de sesión
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar al usuario por el correo electrónico en la base de datos
    const user = await UserModel.findOne({ email });

    if (!user) {
      // No se encontró al usuario, mostrar un mensaje de error
      return res.render('login', { error: 'Usuario no encontrado' });
    }

    // Comparar la contraseña proporcionada con la contraseña almacenada en la base de datos
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // La contraseña no coincide, mostrar un mensaje de error
      return res.render('login', { error: 'Contraseña incorrecta' });
    }

    // La contraseña coincide, iniciar sesión y redirigir al dashboard
    req.session.userValidated = true; // Establecer la autenticación del usuario en la sesión
    req.session.userId = user._id; // Guardar el ID del usuario en la sesión
    return res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error en el inicio de sesión' });
  }
});

router.get('/dashboard', async (req, res) => {
  try {
    if (!req.session.userValidated) {
      // El usuario no está autenticado, redireccionar al inicio de sesión
      return res.redirect('/login');
    }

    // Obtener los productos asociados al usuario autenticado
    const user = await UserModel.findById(req.session.userId).exec();

    if (!user || !Array.isArray(user.products)) {
      // El usuario no tiene productos asociados
      return res.render('products', { response: { error: 'No se encontraron productos asociados al usuario' } });
    }

    const productIds = user.products;

    // Obtener los detalles de los productos del usuario desde la base de datos
    const products = await productModel.find({ _id: { $in: productIds } }).exec();

    // Renderizar la página de productos con los datos correspondientes
    return res.render('products', { response: { products } });
  } catch (error) {
    console.error(error);
    return res.render('products', { response: { error: 'Error al obtener los productos' } });
  }
});


export default router;
