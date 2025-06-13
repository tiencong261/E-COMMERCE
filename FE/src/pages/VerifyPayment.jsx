import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const VerifyPayment = () => {
  const { backendUrl, token } = useContext(ShopContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);
  const { paymentData, orderData } = location.state || {};

  useEffect(() => {
    if (!paymentData || !orderData) {
      navigate("/place-order");
    }
  }, [paymentData, orderData, navigate]);

  const verifyPayment = async () => {
    try {
      setIsVerifying(true);
      const response = await axios.post(
        backendUrl + "/api/order/verify-payment",
        {
          paymentData,
          orderData,
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Payment verified successfully!");
        navigate("/orders");
      } else {
        toast.error(response.data.message || "Payment verification failed");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast.error(error.message || "Error verifying payment");
    } finally {
      setIsVerifying(false);
    }
  };

  if (!paymentData || !orderData) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Verify Payment</h1>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Payment Details</h2>
          <div className="bg-gray-50 p-4 rounded">
            <p className="mb-2">
              <span className="font-medium">Amount:</span> {orderData.amount}
            </p>
            <p className="mb-2">
              <span className="font-medium">Status:</span> Pending
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Complete the payment transaction</li>
            <li>Click the verify button below once payment is complete</li>
          </ol>
        </div>

        <button
          onClick={verifyPayment}
          disabled={isVerifying}
          className={`w-full py-3 rounded text-white font-medium ${
            isVerifying
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black hover:bg-gray-800"
          }`}
        >
          {isVerifying ? "Verifying..." : "Verify Payment"}
        </button>
      </div>
    </div>
  );
};

export default VerifyPayment;
