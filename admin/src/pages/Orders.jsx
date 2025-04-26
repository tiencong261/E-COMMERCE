import React, { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async () => {
    if (!token) {
      return null;
    }

    try {
      const response = await axios.post(
        backendUrl + "/api/order/list",
        {},
        { headers: { token } }
      );
      // console.log(response.data);
      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const deleteAllOrders = async () => {
    if (!token) {
      toast.error("Please login first");
      return;
    }

    try {
      console.log("Deleting all orders...");
      const response = await axios.post(
        backendUrl + "/api/order/delete-all",
        {},
        {
          headers: {
            token,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Delete response:", response.data);

      if (response.data.success) {
        toast.success("All orders have been deleted");
        setOrders([]);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting orders:", error);
      toast.error(error.message);
    }
  };

  // const statusHandler = async (event, orderId) => {
  //   try {
  //     const response = await axios.post(backendUrl+"/api/order/status", {orderId, status:event.target.value}, {headers:{token}})
  //     if (response.data.success) {
  //       await fetchAllOrders();
  //     }

  //   } catch (error) {
  //     console.log(error);
  //     toast.error(error.message);
  //   }
  // }

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/order/status",
        { orderId, status: event.target.value },
        { headers: { token } }
      );

      if (response.data.success) {
        await fetchAllOrders();
        console.log("Status updated successfully:", response.data);
      } else {
        console.error("Failed to update status:", response.data);
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Order Page</h3>
        <button
          onClick={deleteAllOrders}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete All Orders
        </button>
      </div>
      <div>
        {/* Header row */}
        <div className="hidden lg:grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-center border-b-2 border-gray-300 px-5 py-2 font-semibold bg-gray-100 text-gray-700 text-xs sm:text-sm mb-2">
          <div>Sản phẩm</div>
          <div>Thông tin giao hàng</div>
          <div>Thông tin đơn hàng</div>
          <div>Tổng tiền</div>
          <div>Trạng thái</div>
        </div>
        {orders.map((order, index) => (
          <div
            className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700"
            key={index}
          >
            <div className="flex flex-col gap-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <img
                    src={
                      item.image?.[0] ||
                      "https://via.placeholder.com/100x100?text=No+Image"
                    }
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                    onError={(e) => {
                      if (
                        e.target.src !==
                        "https://via.placeholder.com/100x100?text=No+Image"
                      ) {
                        e.target.src =
                          "https://via.placeholder.com/100x100?text=No+Image";
                      }
                    }}
                  />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-gray-500">Size: {item.size}</p>
                    <p className="text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <p className="mt-3 mb-2 font-medium">
                {order.address.firstName + " " + order.address.lastName}
              </p>
              <div>
                <p>{order.address.street + ","}</p>
                <p>
                  {order.address.city +
                    ", " +
                    order.address.state +
                    ", " +
                    order.address.country +
                    ", " +
                    order.address.zipcode}
                </p>
              </div>
              <p>{order.address.phone}</p>
            </div>
            <div>
              <p className="text-sm sm:text-[15px]">
                Items: {order.items.length}
              </p>
              <p className="mt-3">Method: {order.paymentMethod}</p>
              <p>Payment: {order.payment ? "Done" : "Pending"}</p>
              <p>Date: {new Date(order.date).toLocaleDateString()}</p>
            </div>
            <p className="text-sm sm:text-[15px] font-bold">
              {currency} {order.amount}
            </p>
            <select
              onChange={(event) => statusHandler(event, order._id)}
              value={order.status}
              className="p-2 font-semibold border rounded"
            >
              <option value="Order Placed">Order Placed</option>
              <option value="Packing">Packing</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;

// 12:12
