import express from 'express'
import UserRoutes from './Users.js'
import MessageRoutes from './Messages.js';

const router = express.Router();

router.use('/user',UserRoutes)
router.use('/message',MessageRoutes)

export default router