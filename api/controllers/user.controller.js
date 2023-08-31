import productModel from '../../dao/models/products.model.js';
import UserRepository from '../repository/user.repository.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

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
        documents: []
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

      user.last_connection = new Date();
      await user.save();

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

async sendPasswordResetEmail(req, res) {
  const { email } = req.body;

  try {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return res.render('passwordReset', { error: 'Usuario no encontrado' });
    }

    const { token, expiration } = generateTokenAndExpiration();
    await this.userRepository.saveResetToken(user._id, token, expiration);

    const resetLink = `${process.env.APP_URL}/reset/${token}`;
    
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      port: 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Restablecer Contraseña',
      html: `
        <p>Hola ${user.first_name},</p>
        <p>Has solicitado restablecer tu contraseña. Por favor, haz clic en el siguiente enlace:</p>
        <a href="${resetLink}">Restablecer Contraseña</a>
        <p>Este enlace expirará en 1 hora.</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al enviar el correo' });
      } else {
        console.log('Correo electrónico enviado: ' + info.response);
        return res.render('passwordResetSuccess');
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error en la recuperación de contraseña' });
  }
}

async showPasswordResetForm(req, res) {
  const token = req.params.token;
  const isValidToken = await verifyTokenAndExpiration(token);

  if (isValidToken) {
    return res.render('passwordResetForm', { token });
  } else {
    return res.redirect('/token-expired');
  }
}

async resetPassword(req, res) {
  const token = req.params.token;
  const newPassword = req.body.newPassword;

  try {
    const isValidToken = await verifyTokenAndExpiration(token);

    if (isValidToken) {
      const user = await this.userRepository.findByResetToken(token);

      if (!user) {
        return res.render('passwordResetForm', { token, error: 'Usuario no encontrado' });
      }

      if (newPassword === user.password) {
        return res.render('passwordResetForm', { token, error: 'No puedes usar la misma contraseña' });
      }

      await this.userRepository.updatePassword(user._id, newPassword);
      await this.userRepository.deleteResetToken(user._id, token);

      return res.redirect('/login');
    } else {
      return res.render('passwordResetForm', { token, error: 'Enlace expirado o inválido' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error en el restablecimiento de contraseña' });
  }
}

async updateUserToPremium(userId) {
  try {
    // Busca al usuario por su ID
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verifica si el usuario ha cargado todos los documentos requeridos
    const documentosRequeridos = ['Identificación', 'Comprobante de domicilio', 'Comprobante de estado de cuenta'];
    const documentosCargados = user.documents.map(doc => doc.name);

    const documentosFaltantes = documentosRequeridos.filter(doc => !documentosCargados.includes(doc));

    if (documentosFaltantes.length > 0) {
      throw new Error('Faltan documentos requeridos para ser premium');
    }

    // Actualiza el rol del usuario a "premium"
    user.role = 'premium';

    // Guarda los cambios en la base de datos
    await user.save();

    return user; // Devuelve el usuario actualizado
  } catch (error) {
    throw error;
  }
}


}
export default UserController;
