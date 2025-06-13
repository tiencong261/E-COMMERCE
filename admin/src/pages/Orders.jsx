import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { assets } from "../assets/assets";
import Modal from "react-modal";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/order/admin`,
        {
          headers: {
            token: localStorage.getItem("adminToken"),
          },
        }
      );
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/order/${orderId}`,
        { status: newStatus },
        {
          headers: {
            token: localStorage.getItem("adminToken"),
          },
        }
      );
      if (response.data.success) {
        toast.success("Cập nhật trạng thái thành công");
        loadOrders();
      }
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const handleReturnRequest = async (orderId, action) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/order/return-request/${orderId}`,
        { action },
        {
          headers: {
            token: localStorage.getItem("adminToken"),
          },
        }
      );
      if (response.data.success) {
        toast.success("Xử lý yêu cầu đổi trả thành công");
        loadOrders();
      }
    } catch (error) {
      toast.error("Lỗi khi xử lý yêu cầu đổi trả");
    }
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Quản lý đơn hàng</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã đơn hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khách hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sản phẩm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tổng tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phương thức thanh toán
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order._id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.userId?.name || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-h-20 overflow-y-auto">
                    {order.items.map((item, index) => (
                      <div key={index} className="mb-1">
                        {item.name} - {item.quantity} x {item.size}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.amount.toLocaleString()} VND
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.paymentMethod}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      order.status
                    )} text-white`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex flex-col gap-2">
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                    >
                      <option value="Chờ xác nhận">Chờ xác nhận</option>
                      <option value="Đã xác nhận">Đã xác nhận</option>
                      <option value="Đang giao hàng">Đang giao hàng</option>
                      <option value="Đã giao hàng">Đã giao hàng</option>
                      <option value="Đã hủy">Đã hủy</option>
                    </select>
                    {order.returnRequest && order.returnRequest.requested && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleReturnRequest(order._id, "approve")
                          }
                          className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                        >
                          Chấp nhận
                        </button>
                        <button
                          onClick={() =>
                            handleReturnRequest(order._id, "reject")
                          }
                          className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                        >
                          Từ chối
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowModal(true);
                      }}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Chi tiết
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Chi tiết đơn hàng</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Thông tin khách hàng</h3>
                <p>Tên: {selectedOrder.userId?.name || "N/A"}</p>
                <p>Email: {selectedOrder.userId?.email || "N/A"}</p>
              </div>
              <div>
                <h3 className="font-semibold">Địa chỉ giao hàng</h3>
                <p>{selectedOrder.address?.street}</p>
                <p>
                  {selectedOrder.address?.city}, {selectedOrder.address?.state}
                </p>
                <p>
                  {selectedOrder.address?.zipcode},{" "}
                  {selectedOrder.address?.country}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Sản phẩm</h3>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 py-2">
                    <img
                      src={item.image[0]}
                      alt={item.name}
                      className="w-16 h-16 object-cover"
                    />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p>Size: {item.size}</p>
                      <p>Số lượng: {item.quantity}</p>
                      <p>Giá: {item.price.toLocaleString()} VND</p>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="font-semibold">Thông tin thanh toán</h3>
                <p>Phương thức: {selectedOrder.paymentMethod}</p>
                <p>Tổng tiền: {selectedOrder.amount.toLocaleString()} VND</p>
                <p>Trạng thái: {selectedOrder.status}</p>
              </div>
              {selectedOrder.returnRequest &&
                selectedOrder.returnRequest.requested && (
                  <div>
                    <h3 className="font-semibold">Yêu cầu đổi trả</h3>
                    <p>Lý do: {selectedOrder.returnRequest.reason}</p>
                    <p>Trạng thái: {selectedOrder.returnRequest.status}</p>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
