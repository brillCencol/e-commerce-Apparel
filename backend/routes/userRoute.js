import express from 'express';
import { loginUser, registerUser, adminLogin } from '../controllers/userController.js';
import { getMe, updateMe, updatePassword } from '../controllers/accountController.js';
import authUser from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/admin', adminLogin);

userRouter.get('/me', authUser, getMe);
userRouter.put('/me', authUser, updateMe);
userRouter.put('/password', authUser, updatePassword);

export default userRouter;
