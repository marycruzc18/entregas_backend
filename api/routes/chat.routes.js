import express from 'express';
import chatcontroller from '../controllers/chat.controller.js'
import { authenticateUser, authorize } from '../Middleware/authMiddleware.js';



const router = express.Router();

router.get('/', chatcontroller.renderChat);
router.post('/chat', authorize(['user']), chatcontroller.saveMessage);



export default router;