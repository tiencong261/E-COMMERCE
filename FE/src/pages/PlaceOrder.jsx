import React, { useState } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useCreateOrderMutation } from "../slices/ordersApiSlice";
import { clearCartItems } from "../slices/cartSlice";
import { FaCreditCard, FaMoneyBillWave } from "react-icons/fa";
import { SiVisa } from "react-icons/si";
import { SiSolana } from "react-icons/si";
import { toast } from "react-toastify";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });
  const cart = useSelector((state) => state.cart);
  const [paymentMethod, setPaymentMethod] = useState(
    "Thanh toán khi nhận hàng"
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [solanaPaymentData, setSolanaPaymentData] = useState(null);
  const [createOrder] = useCreateOrderMutation();

  const onChangeHandle = (event) => {
    const { name, value } = event.target;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const placeOrderHandler = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setSolanaPaymentData(null);
    try {
      // Validate form
      for (const key in formData) {
        if (!formData[key]) {
          toast.error("Vui lòng điền đầy đủ thông tin giao hàng!");
          setIsProcessing(false);
          return;
        }
      }
      if (!cart.cartItems || cart.cartItems.length === 0) {
        toast.error("Giỏ hàng trống!");
        setIsProcessing(false);
        return;
      }
      const res = await createOrder({
        orderItems: cart.cartItems,
        shippingAddress: formData,
        paymentMethod,
        itemsPrice: cart.itemsPrice,
        taxPrice: cart.taxPrice,
        shippingPrice: cart.shippingPrice,
        totalPrice: cart.totalPrice,
      }).unwrap();
      if (paymentMethod === "Thanh toán qua Solana") {
        if (res.success) {
          setSolanaPaymentData({
            paymentUrl: res.paymentUrl,
            amount: res.amount,
            amountInVnd: res.amountInVnd,
            reference: res.reference,
            orderId: res.order._id,
          });
        } else {
          toast.error(res.message || "Lỗi khi tạo thanh toán Solana");
        }
      } else {
        if (res.success) {
          dispatch(clearCartItems());
          navigate(`/order/${res.order._id}`);
        } else {
          toast.error(res.message || "Lỗi khi đặt hàng");
        }
      }
    } catch (err) {
      toast.error(err?.data?.message || err.error || "Lỗi không xác định");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSolanaPaymentComplete = async () => {
    try {
      setIsProcessing(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/solana/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization có thể cần lấy từ localStorage hoặc redux nếu có đăng nhập
          },
          body: JSON.stringify({ reference: solanaPaymentData.reference }),
        }
      );
      const data = await res.json();
      if (data.success && data.verified) {
        toast.success("Thanh toán thành công!");
        dispatch(clearCartItems());
        navigate(`/order/${solanaPaymentData.orderId}`);
      } else {
        toast.error(data.message || "Thanh toán thất bại");
      }
    } catch (err) {
      toast.error("Lỗi khi xác minh thanh toán");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form
      onSubmit={placeOrderHandler}
      className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t"
    >
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <Title text1="DELIVERY" text2="INFORMATION" />
        <div className="flex gap-3">
          <input
            onChange={onChangeHandle}
            name="firstName"
            value={formData.firstName}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="First name"
          />
          <input
            onChange={onChangeHandle}
            name="lastName"
            value={formData.lastName}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Last name"
          />
        </div>
        <input
          onChange={onChangeHandle}
          name="email"
          value={formData.email}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="email"
          placeholder="Email address"
        />
        <input
          onChange={onChangeHandle}
          name="street"
          value={formData.street}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="text"
          placeholder="Street"
        />
        <div className="flex gap-3">
          <input
            onChange={onChangeHandle}
            name="city"
            value={formData.city}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="City"
          />
          <input
            onChange={onChangeHandle}
            name="state"
            value={formData.state}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="State"
          />
        </div>
        <div className="flex gap-3">
          <input
            onChange={onChangeHandle}
            name="zipcode"
            value={formData.zipcode}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Zipcode"
          />
          <input
            onChange={onChangeHandle}
            name="country"
            value={formData.country}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Country"
          />
        </div>
        <input
          onChange={onChangeHandle}
          name="phone"
          value={formData.phone}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="text"
          placeholder="Phone"
        />
      </div>
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <Title text1="PAYMENT" text2="METHOD" />
        <CartTotal />
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">
            Phương thức thanh toán
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              type="button"
              onClick={() => setPaymentMethod("Thanh toán khi nhận hàng")}
              className={`p-4 rounded-lg border ${
                paymentMethod === "Thanh toán khi nhận hàng"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300"
              }`}
            >
              <FaMoneyBillWave className="mx-auto text-2xl mb-2" />
              <span>Thanh toán khi nhận hàng</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("Thanh toán qua Stripe")}
              className={`p-4 rounded-lg border ${
                paymentMethod === "Thanh toán qua Stripe"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300"
              }`}
            >
              <FaCreditCard className="mx-auto text-2xl mb-2" />
              <span>Thanh toán qua Stripe</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("Thanh toán qua VNPay")}
              className={`p-4 rounded-lg border ${
                paymentMethod === "Thanh toán qua VNPay"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300"
              }`}
            >
              <SiVisa className="mx-auto text-2xl mb-2" />
              <span>Thanh toán qua VNPay</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("Thanh toán qua Solana")}
              className={`p-4 rounded-lg border ${
                paymentMethod === "Thanh toán qua Solana"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300"
              }`}
            >
              <SiSolana className="mx-auto text-2xl mb-2" />
              <span>Thanh toán qua Solana</span>
            </button>
          </div>
        </div>
        <div className="mt-8">
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isProcessing ? "Đang xử lý..." : "Đặt hàng"}
          </button>
        </div>
        {solanaPaymentData && (
          <div className="mt-8 p-4 border rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Thanh toán Solana</h3>
            <p className="mb-2">Số tiền: {solanaPaymentData.amount} SOL</p>
            <p className="mb-2">
              Tương đương: {solanaPaymentData.amountInVnd.toLocaleString()} VND
            </p>
            <div className="flex justify-center mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  solanaPaymentData.paymentUrl
                )}`}
                alt="QR Code"
                className="w-48 h-48"
              />
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleSolanaPaymentComplete}
                disabled={isProcessing}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {isProcessing ? "Đang xác minh..." : "Tôi đã thanh toán"}
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default PlaceOrder;
