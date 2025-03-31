import express from 'express'
import {placeOrder, placeOrderStripe, placeOrderRazorpay, allOrder, userOrders, updateStatus} from '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'


const orderRouter = express.Router();

//Admin Features
orderRouter.post('/list', adminAuth, allOrder);
orderRouter.post('/status', adminAuth, updateStatus);

//Payment Features
orderRouter.post('/place',authUser,placeOrder);
orderRouter.post('/stripe', authUser, placeOrderStripe);
orderRouter.post('razorpay', authUser, placeOrderRazorpay);

//User Features
orderRouter.post('/userorders', authUser, userOrders);

export default orderRouter;
