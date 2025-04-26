import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import moment from "moment";
import crypto from "crypto";
import querystring from "qs";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

// global variables
const currency = "inr"; // Lưu ý: VNPAY chỉ hỗ trợ VND
const deliveryCharge = 10;

// gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//Placing orders using COD Method
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: "Order Placed" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

//Placing orders using Stripe Method
const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;
    const { origin } = req.body;

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const line_items = items.map((item) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: currency,
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: deliveryCharge * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: "payment",
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Verify Stripe
const verifyStripe = async (req, res) => {
  const { orderId, success, userId } = req.body;

  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      res.json({ success: true });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

//Placing orders using VNPAY Method
// const placeOrderVnpay = async (req, res) => {
//     try {
//         const { userId, items, amount, address } = req.body;
//         const amountVND = amount;

//         const newOrder = new orderModel({
//             userId,
//             items,
//             address,
//             amount: amountVND,
//             paymentMethod: "VNPay",
//             payment: false,
//             date: Date.now()
//         });
//         await newOrder.save();

//         const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//         const orderInfo = `Thanh toan don hang #${newOrder._id}`;
//         const returnUrl = `${req.protocol}://${req.get('host')}/order/vnpay_return`;
//         const transactionId = newOrder._id.toString();
//         const createDate = moment().format('YYYYMMDDHHmmss');
//         const expireDate = moment().add(15, 'minutes').format('YYYYMMDDHHmmss');

//         const vnp_TmnCode = process.env.VNPAY_TMN_CODE;
//         const vnp_HashSecret = process.env.VNPAY_HASH_SECRET;
//         const vnp_Url = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';

//         const vnpParams = {
//             vnp_Version: '2.1.0',
//             vnp_Command: 'pay',
//             vnp_TmnCode,
//             vnp_Amount: amountVND * 100, // VNPay yêu cầu x100
//             vnp_CurrCode: 'VND',
//             vnp_TxnRef: transactionId,
//             vnp_OrderInfo: orderInfo,
//             vnp_Locale: 'vn',
//             vnp_ReturnUrl: returnUrl,
//             vnp_IpAddr: ipAddr === '::1' ? '127.0.0.1' : ipAddr,
//             vnp_CreateDate: createDate,
//             vnp_ExpireDate: expireDate,
//         };

//         console.log(vnpParams)

//         const sortedParams = sortObject(vnpParams);
//         const signData = querystring.stringify(sortedParams, { encode: false });
//         const hmac = crypto.createHmac('sha512', vnp_HashSecret);
//         const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
//         sortedParams['vnp_SecureHash'] = signed;

//         const paymentUrl = `${vnp_Url}?${querystring.stringify(sortedParams, { encode: false })}`;

//         res.json({ success: true, message: "Redirecting to VNPay", paymentUrl });
//     } catch (err) {
//         console.error("VNPay Error:", err);
//         res.status(500).json({ success: false, message: err.message });
//     }
// };

// // Sắp xếp object theo thứ tự key
// function sortObject(obj) {
//     const sorted = {};
//     const keys = Object.keys(obj).sort();
//     for (const key of keys) {
//         sorted[key] = obj[key];
//     }
//     return sorted;
// }

// // VnPay Return
// const vnpayReturn = async (req, res) => {
//     const query = req.query;
//     const vnp_SecureHash = query.vnp_SecureHash;

//     delete query.vnp_SecureHash;
//     delete query.vnp_SecureHashType;

//     const sortedQuery = sortObject(query);
//     const signData = querystring.stringify(sortedQuery, { encode: false });
//     const secret = process.env.VNPAY_HASH_SECRET;
//     const hmac = crypto.createHmac('sha512', secret);
//     const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

//     if (signed === vnp_SecureHash) {
//         // ✅ Giao dịch thành công → Cập nhật đơn hàng
//         await orderModel.findByIdAndUpdate(query.vnp_TxnRef, {
//             payment: true,
//             paymentTime: Date.now()
//         });

//         return res.send("Thanh toán thành công. Cảm ơn bạn!");
//     } else {
//         return res.send("Thanh toán thất bại. Chữ ký không hợp lệ.");
//     }
// };

//All order data for Admin Panel
const allOrder = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

//User order data for Forntend
const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await orderModel.find({ userId });
    res.json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

//update order status from Admin Panel
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

const deleteAllOrders = async (req, res) => {
  try {
    const result = await orderModel.deleteMany({});
    console.log("Deleted orders:", result);
    res.json({ success: true, message: "All orders have been deleted" });
  } catch (error) {
    console.error("Error deleting all orders:", error);
    res.status(500).json({ success: false, message: "Error deleting orders" });
  }
};

export const getRevenue = async (req, res) => {
  try {
    const result = await orderModel.aggregate([
      { $match: { payment: true } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const total = result[0]?.total || 0;
    res.json({ success: true, total });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error calculating revenue" });
  }
};

export {
  verifyStripe,
  placeOrder,
  placeOrderStripe,
  allOrder,
  userOrders,
  updateStatus,
  deleteAllOrders,
};
