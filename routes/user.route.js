import express from 'express';
import UserController from '../controllers/userController.js';
import checkUserAuth from '../middlewares/auth.middleware.js';

const router = express.Router();

// Route Level Middleware - To Protect Route
router.use('/changePassword',checkUserAuth);

// Public Routes
router.post('/register', UserController.userRegistration);
router.post('/login', UserController.userLogin);

// Protected Routes
router.post('/changePassword', UserController.changeUserPassword);


export default router;