import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        image: { type: [String], required: true },
      },
    ],
    amount: { type: Number, required: true },
    address: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipcode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
    },
    status: { type: String, default: "Processing" },
    payment: { type: Boolean, default: false },
    paymentMethod: { type: String, required: true },
    paymentTime: { type: Number },
    date: { type: Number, required: true },
    refunded: { type: Boolean, default: false },
    returnRequest: {
      requested: { type: Boolean, default: false },
      reason: String,
      status: { type: String, enum: ["pending", "approved", "rejected"] },
      requestDate: Date,
      processDate: Date,
      adminNote: String,
    },
    cryptoPayment: {
      address: String,
      amount: Number,
      confirms_needed: Number,
      timeout: Number,
      status_url: String,
      qrcode_url: String,
      status: { type: String, enum: ["pending", "completed", "failed"] },
      txid: String,
    },
  },
  { timestamps: true }
);

const orderModel = mongoose.model("orders", orderSchema);

export default orderModel;
