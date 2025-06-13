import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Stripe from "stripe";
import crypto from "crypto";
import moment from "moment";
import querystring from "qs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//Placing orders using COD Method
const placeOrder = async (req, res) => {
  try {
    const { address, items, amount } = req.body;
    const userId = req.user.id;

    const newOrder = new Order({
      userId,
      items,
      amount,
      address,
      paymentMethod: "COD",
    });

    await newOrder.save();
    res.status(200).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({
      success: false,
      message: "Error placing order",
      error: error.message,
    });
  }
};

//Placing orders using Stripe Method
const placeOrderStripe = async (req, res) => {
  try {
    const { address, items, amount, origin } = req.body;
    const userId = req.user.id;

    const newOrder = new Order({
      userId,
      items,
      amount,
      address,
      paymentMethod: "Stripe",
    });

    await newOrder.save();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Order Payment",
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/verify-payment?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/place-order`,
    });

    res.status(200).json({
      success: true,
      session_url: session.url,
    });
  } catch (error) {
    console.error("Error creating Stripe session:", error);
    res.status(500).json({
      success: false,
      message: "Error creating payment session",
      error: error.message,
    });
  }
};

//Placing orders using VNPay Method
const placeOrderVnpay = async (req, res) => {
  try {
    const { address, items, amount } = req.body;
    const userId = req.user.id;

    const newOrder = new Order({
      userId,
      items,
      amount,
      address,
      paymentMethod: "VNPay",
    });

    await newOrder.save();

    const date = new Date();
    const createDate = moment(date).format("YYYYMMDDHHmmss");

    const orderId = moment(date).format("HHmmss");
    const orderInfo = `Thanh toan don hang ${orderId}`;
    const orderType = "other";
    const locale = "vn";
    const currCode = "VND";
    const vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = process.env.VNP_TMN_CODE;
    vnp_Params["vnp_Locale"] = locale;
    vnp_Params["vnp_CurrCode"] = currCode;
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = orderInfo;
    vnp_Params["vnp_OrderType"] = orderType;
    vnp_Params["vnp_Amount"] = amount * 100;
    vnp_Params["vnp_ReturnUrl"] = process.env.VNP_RETURN_URL;
    vnp_Params["vnp_IpAddr"] = req.ip;
    vnp_Params["vnp_CreateDate"] = createDate;

    const sortedParams = sortObject(vnp_Params);
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", process.env.VNP_HASH_SECRET);
    const signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;
    const vnpUrl =
      process.env.VNP_URL +
      "?" +
      querystring.stringify(vnp_Params, { encode: false });

    res.status(200).json({
      success: true,
      paymentUrl: vnpUrl,
    });
  } catch (error) {
    console.error("Error creating VNPay payment:", error);
    res.status(500).json({
      success: false,
      message: "Error creating payment",
      error: error.message,
    });
  }
};

// Place order using Solana
export const placeOrderSolana = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error("No order items");
    }

    const order = await Order.create({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      amount: totalPrice,
      paymentStatus: "Chưa thanh toán",
    });

    // Generate Solana payment URL
    const paymentData = await generatePaymentUrl(order);

    if (!paymentData.success) {
      res.status(400);
      throw new Error(paymentData.message);
    }

    res.status(201).json({
      success: true,
      order,
      paymentUrl: paymentData.paymentUrl,
      amount: paymentData.amount,
      amountInVnd: paymentData.amountInVnd,
      reference: paymentData.reference,
    });
  } catch (error) {
    console.error("Solana payment error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi tạo thanh toán Solana",
    });
  }
};

// Verify Solana payment
export const verifySolanaPayment = async (req, res) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      res.status(400);
      throw new Error("Missing payment reference");
    }

    // Verify payment status
    const result = await pollPaymentStatus(reference);

    if (!result.success) {
      res.status(400);
      throw new Error(result.message);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Solana verification error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi xác minh thanh toán Solana",
    });
  }
};

//Get all orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id });
    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error getting orders:", error);
    res.status(500).json({
      success: false,
      message: "Error getting orders",
      error: error.message,
    });
  }
};

//Get order by id
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error getting order:", error);
    res.status(500).json({
      success: false,
      message: "Error getting order",
      error: error.message,
    });
  }
};

//Update order
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order",
      error: error.message,
    });
  }
};

//Delete order
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting order",
      error: error.message,
    });
  }
};

// Get all orders for admin
const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error getting admin orders:", error);
    res.status(500).json({
      success: false,
      message: "Error getting orders",
      error: error.message,
    });
  }
};

// Handle return request
const handleReturnRequest = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { action } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!order.returnRequest || !order.returnRequest.requested) {
      return res.status(400).json({
        success: false,
        message: "No return request found for this order",
      });
    }

    if (action === "approve") {
      order.returnRequest.status = "Đã chấp nhận";
      order.status = "Đã hủy";
    } else if (action === "reject") {
      order.returnRequest.status = "Đã từ chối";
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid action",
      });
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Return request handled successfully",
      order,
    });
  } catch (error) {
    console.error("Error handling return request:", error);
    res.status(500).json({
      success: false,
      message: "Error handling return request",
      error: error.message,
    });
  }
};

// Helper function to sort object keys alphabetically
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}

export {
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
};
