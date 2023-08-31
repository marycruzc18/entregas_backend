import express from 'express';
import multer from 'multer';
import UserController from '../controllers/user.controller.js';
import { uploadUserDocuments } from '../controllers/userDocumentsController.js';
import {authenticateUser} from '../Middleware/authMiddleware.js';


const router = express.Router();
const userController = new UserController();

const storage = multer.memoryStorage();
const upload = multer({ storage });


router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', userController.registerUser.bind(userController));

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', userController.loginUser.bind(userController));

router.get('/api/sessions/current', userController.getCurrentSession.bind(userController));

router.post('/send-password-reset-email', userController.sendPasswordResetEmail.bind(userController));

router.get('/reset/:token', userController.showPasswordResetForm.bind(userController));

router.post('/reset/:token', userController.resetPassword.bind(userController));

router.post('/api/users/:uid/documents', authenticateUser, upload.array('documents'), uploadUserDocuments);

router.post('/api/users/premium/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const updatedUser = await userController.updateUserToPremium(uid);

    return res.status(200).json({ message: 'Usuario actualizado a premium', user: updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al actualizar el usuario a premium' });
  }
});

export default router;

