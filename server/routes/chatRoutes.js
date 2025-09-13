// import  express from 'express';
// import { createChat ,deleteChat,getChats} from '../controllers/chatController.js';
// import { protect } from '../middlewares/auth.js';

// const chatRouter=express.Router();

// chatRouter.get('/create',protect, createChat);

// chatRouter.get('/get',protect, getChats);
// chatRouter.post('/delete',protect, deleteChat);


// export default chatRouter;




import express from 'express';
import { createChat, deleteChat, getChats } from '../controllers/chatController.js';
import { protect } from '../middlewares/auth.js';

const chatRouter = express.Router();

// ✅ Make chat creation a POST request
chatRouter.post('/', protect, createChat);

// ✅ Get all chats
chatRouter.get('/get', protect, getChats);

// ✅ Delete chat
chatRouter.post('/delete', protect, deleteChat);

export default chatRouter;
