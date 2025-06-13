import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";
import { toast } from "react-toastify";

const Order = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrderData = async () => {
    try {
      if (!token) {
        return null;
      }
      setLoading(true);
      const response = await axios.get(backendUrl + "/api/order", {
        headers: { token },
      });

      if (response.data.success) {
        let allOrdersItem = [];
        response.data.orders.map((order) => {
          order.items.map((item) => {
            item["status"] = order.status;
            item["payment"] = order.payment;
            item["paymentMethod"] = order.paymentMethod;
            item["date"] = order.date;
            item["orderId"] = order._id;
            item["returnRequest"] = order.returnRequest;
            allOrdersItem.push(item);
          });
        });
        setOrderData(allOrdersItem.reverse());
      }
    } catch (error) {
      toast.error("Lỗi khi tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Đã xác nhận":
        return "bg-blue-500";
      case "Đang giao hàng":
        return "bg-yellow-500";
      case "Đã giao hàng":
        return "bg-green-500";
      case "Đã hủy":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleReturnRequest = async (orderId, reason) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/order/return-request",
        { orderId, reason },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Đã gửi yêu cầu đổi trả/hoàn tiền!");
        loadOrderData();
      }
    } catch (error) {
      toast.error("Gửi yêu cầu thất bại!");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"ĐƠN HÀNG"} text2={"CỦA TÔI"} />
      </div>

      <div>
        {orderData.length === 0 ? (
          <div className="text-center py-10">
            <p>Bạn chưa có đơn hàng nào</p>
          </div>
        ) : (
          orderData.map((item, index) => {
            const returnRequest = item.returnRequest;
            return (
              <div
                key={index}
                className="py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="flex items-start gap-6 text-sm">
                  <img className="w-16 sm:w-20" src={item.image[0]} alt="" />
                  <div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm">{item.name}</p>
                      <p className="text-sm">
                        {item.price} {currency}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-base text-gray-700">
                      <p>Số lượng: {item.quantity}</p>
                      <p>Size: {item.size}</p>
                    </div>
                    <p className="mt-2">
                      Ngày:{" "}
                      <span className="text-gray-400">
                        {new Date(item.date).toLocaleDateString("vi-VN")}
                      </span>
                    </p>
                    <p className="mt-2">
                      Thanh toán:{" "}
                      <span className="text-gray-400">
                        {item.paymentMethod}
                      </span>
                    </p>
                    {returnRequest && returnRequest.requested ? (
                      <p className="mt-2 text-blue-600">
                        Yêu cầu đổi trả: <b>{returnRequest.status}</b>
                        {returnRequest.reason
                          ? ` - ${returnRequest.reason}`
                          : ""}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="md:w-1/2 flex flex-col gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <p
                      className={`min-w-2 h-2 rounded-full ${getStatusColor(
                        item.status
                      )}`}
                    ></p>
                    <p className="text-sm md:text-base">{item.status}</p>
                  </div>
                  <button
                    onClick={loadOrderData}
                    className="border px-4 py-2 text-sm font-medium rounded-sm hover:bg-gray-100"
                  >
                    Cập nhật trạng thái
                  </button>
                  {(!returnRequest || !returnRequest.requested) &&
                    item.status !== "Đã hủy" && (
                      <button
                        className="border px-4 py-2 text-sm font-medium rounded-sm mt-2 bg-yellow-100 hover:bg-yellow-200"
                        onClick={async () => {
                          const reason = prompt(
                            "Nhập lý do đổi trả/hoàn tiền:"
                          );
                          if (!reason) return;
                          handleReturnRequest(item.orderId, reason);
                        }}
                      >
                        Yêu cầu đổi trả/hoàn tiền
                      </button>
                    )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Order;
