import express from 'express';
import UserController from '../controllers/user.controller.js';
import checkUserAuth from '../middlewares/auth.middleware.js';

const router = express.Router();

// Route Level Middleware - To Protect Route
router.use('/changePassword', checkUserAuth);
router.use('/loggedUser', checkUserAuth)


// Public Routes
router.post('/register', UserController.userRegistration);
router.post('/login', UserController.userLogin);
router.post('/send-reset-password-email', UserController.sendUserPasswordResetEmail);
router.post('/reset-password/:id/:token', UserController.userPasswordReset)

// Protected Routes
router.post('/changePassword', UserController.changeUserPassword);
router.get('/loggedUser', UserController.loggedUser)

export default router;