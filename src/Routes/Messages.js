import express from 'express';
import MessageController from '../Controllers/Messages.js';
import Auth from '../Common/Auth.js';

const router = express.Router();

router.get('/sidebar-users', Auth.validate, MessageController.getUsersForSidebar);
router.get('/chats/:userId',Auth.validate, MessageController.getMessages);
router.post('/send/:id',Auth.validate,MessageController.sendMessage)
router.post("/create-chat/:userId",Auth.validate,MessageController.CreateConversation)

export default router;

