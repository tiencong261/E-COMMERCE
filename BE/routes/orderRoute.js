import express from 'express'
import {placeOrder, placeOrderStripe, placeOrderVnpay, vnpayReturn, allOrder, userOrders, updateStatus, verifyStripe} from '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'


const orderRouter = express.Router();

//Admin Features
orderRouter.post('/list', adminAuth, allOrder);
orderRouter.post('/status', adminAuth, updateStatus);

//Payment Features
orderRouter.post('/place',authUser,placeOrder);
orderRouter.post('/stripe', authUser, placeOrderStripe);
orderRouter.post('/vnpay', authUser, placeOrderVnpay);
orderRouter.get("/vnpay_return", vnpayReturn);

//User Features
orderRouter.post('/userorders', authUser, userOrders);

// verify payment
orderRouter.post('/verifyStripe', authUser, verifyStripe)

export default orderRouter;
// 12"35
