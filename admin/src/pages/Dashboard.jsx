import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const Dashboard = ({ token }) => {
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/order/revenue`, {
        headers: { token },
      });
      if (response.data.success) {
        setRevenue(response.data.total);
      } else {
        toast.error(response.data.message || "Không thể lấy dữ liệu doanh thu");
      }
    } catch (error) {
      console.error("Error fetching revenue:", error);
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, [token]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="bg-white rounded shadow p-6 w-full max-w-md">
        <div className="text-lg font-semibold text-gray-700 mb-2">
          Tổng doanh thu
        </div>
        {loading ? (
          <div className="text-gray-500">Đang tải...</div>
        ) : (
          <div className="text-3xl font-bold text-green-600">
            {currency} {revenue.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
