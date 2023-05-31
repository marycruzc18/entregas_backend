import express from 'express';
import chatcontroller from './controllers/chat.controller.js'


const router = express.Router();

router.get('/', chatcontroller.renderChat);
router.post('/', chatcontroller.saveMessage);

export default router;