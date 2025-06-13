import express from "express";
import authUser from "../middleware/auth.js";
import authAdmin from "../middleware/authAdmin.js";
import {
  placeOrder,
  placeOrderStripe,
  placeOrderVnpay,
  placeOrderSolana,
  verifySolanaPayment,
  getOrders,
  getOrder,
  updateOrder,
  deleteOrder,
  getAdminOrders,
  handleReturnRequest,
} from "../controllers/orderController.js";

const orderRouter = express.Router();

// User routes
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/stripe", authUser, placeOrderStripe);
orderRouter.post("/vnpay", authUser, placeOrderVnpay);
orderRouter.post("/solana", authUser, placeOrderSolana);
orderRouter.post("/solana/verify", authUser, verifySolanaPayment);
orderRouter.get("/", authUser, getOrders);
orderRouter.get("/:id", authUser, getOrder);
orderRouter.put("/:id", authUser, updateOrder);
orderRouter.delete("/:id", authUser, deleteOrder);

// Admin routes
orderRouter.get("/admin", authAdmin, getAdminOrders);
orderRouter.put("/return-request/:orderId", authAdmin, handleReturnRequest);

export default orderRouter;
