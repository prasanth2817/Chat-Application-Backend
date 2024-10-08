import express from 'express';
import MessageController from '../Controllers/Messages.js';

const router = express.Router();

router.post('/messages', MessageController.createMessages);
router.get('/messages/:personId', MessageController.getMessages);

export default router;

