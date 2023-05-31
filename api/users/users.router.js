import { Router } from 'express';
import UserModel from '../../dao/models/user.model.js';

const router = Router();

router.post('/sessions', async (req, res) => {
  // Extraer los datos del cuerpo de la solicitud
  const { first_name, last_name, email, age, password } = req.body;

  try {
    // Crear una instancia del modelo de usuario con los datos recibidos
    const newUser = new UserModel({
      first_name,
      last_name,
      email,
      age,
      password,
    });

    // Guardar el nuevo usuario en la base de datos
    await newUser.save();

    res.status(200).json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar el usuario' });
  }
});

export default router;
