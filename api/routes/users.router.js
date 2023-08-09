import express from 'express';
import UserController from '../controllers/user.controller.js';

const router = express.Router();
const userController = new UserController();

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

export default router;

