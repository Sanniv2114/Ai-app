import express from 'express';
import { imageMessageController, textMessageController } from '../controllers/messageController.js';
import { protect } from '../middlewares/auth.js'; // ✅ Import protect middleware

const messageRouter = express.Router();

// Routes
messageRouter.post('/text', protect, textMessageController);
messageRouter.post('/image', protect, imageMessageController);

export default messageRouter;
