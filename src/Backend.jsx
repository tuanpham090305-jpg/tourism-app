import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { API_URL } from "./config";

const formatVnd = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);

export default function Backend({
  foods,
  services,
  orders,
  setOrders,
  setFoods,
  setServices,
  siteInfo,
  setSiteInfo,
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/orders`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((o) => ({
          id: o.id,
          customer: {
            name: o.customer_name,
            phone: o.phone,
            note: o.note,
          },
          items: JSON.parse(o.items || "[]"),
          total: o.total,
          status: o.status,
          time: o.created_at,
        }));

        setOrders(formatted);
      });

    const socket = io(API_URL);

    socket.on("newOrder", (order) => {
      setOrders((prev) => [order, ...prev]);
      alert("Có đơn hàng mới!");
    });

    return () => socket.disconnect();
  }, [setOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        String(order.id).toLowerCase().includes(keyword) ||
        order.customer?.name?.toLowerCase().includes(keyword) ||
        order.customer?.phone?.toLowerCase().includes(keyword);

      const matchStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const totalRevenue = orders
    .filter((order) => order.status === "Hoàn tất")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const updateOrderStatus = async (id, status) => {
    await fetch(`${API_URL}/api/orders/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    setOrders((prev) =>
      prev.map((order) =>
        String(order.id) === String(id) ? { ...order, status } : order
      )
    );
  };

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <span className="admin-pill">Quản lý đơn hàng</span>
        <h2>Danh sách đơn đặt của khách</h2>
        <p>
          Theo dõi đơn mới realtime, xem chi tiết khách hàng, dịch vụ đã đặt và
          cập nhật trạng thái xử lý.
        </p>
      </section>

      <section className="admin-stats">
        <div className="admin-stat-card">
          <span>Tổng đơn</span>
          <strong>{orders.length}</strong>
          <p>Tất cả đơn đã đặt</p>
        </div>

        <div className="admin-stat-card highlight-orange">
          <span>Đơn mới</span>
          <strong>{orders.filter((o) => o.status === "Mới").length}</strong>
          <p>Cần xử lý ngay</p>
        </div>

        <div className="admin-stat-card highlight-blue">
          <span>Đang xử lý</span>
          <strong>
            {orders.filter((o) => o.status === "Đang xử lý").length}
          </strong>
          <p>Nhân viên đang phục vụ</p>
        </div>

        <div className="admin-stat-card highlight-green">
          <span>Doanh thu</span>
          <strong>{formatVnd(totalRevenue)}</strong>
          <p>Từ đơn hoàn tất</p>
        </div>
      </section>

      <section className="admin-main-panel">
        <div className="admin-panel-header">
          <div>
            <h2>Danh sách đơn hàng</h2>
            <p>Quản lý toàn bộ đơn khách đã đặt</p>
          </div>

          <input
            className="admin-search"
            placeholder="Tìm mã đơn, tên khách, số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="admin-filter">
          <button
            className={statusFilter === "all" ? "active" : ""}
            onClick={() => setStatusFilter("all")}
          >
            Tất cả
          </button>

          <button
            className={statusFilter === "Mới" ? "active" : ""}
            onClick={() => setStatusFilter("Mới")}
          >
            Mới
          </button>

          <button
            className={statusFilter === "Đang xử lý" ? "active" : ""}
            onClick={() => setStatusFilter("Đang xử lý")}
          >
            Đang xử lý
          </button>

          <button
            className={statusFilter === "Hoàn tất" ? "active" : ""}
            onClick={() => setStatusFilter("Hoàn tất")}
          >
            Hoàn tất
          </button>
        </div>

        <div className="order-list">
          {filteredOrders.length === 0 ? (
            <div className="admin-empty">Chưa có đơn hàng nào.</div>
          ) : (
            filteredOrders.map((order) => (
              <div className="order-card" key={order.id}>
                <div className="order-card-top">
                  <div>
                    <h3>Đơn #{order.id}</h3>
                    <p>{order.time || "Không có thời gian"}</p>
                  </div>

                  <span
                    className={
                      order.status === "Mới"
                        ? "status-badge status-new"
                        : order.status === "Đang xử lý"
                        ? "status-badge status-processing"
                        : "status-badge status-done"
                    }
                  >
                    {order.status}
                  </span>
                </div>

                <div className="order-customer">
                  <p>
                    <b>Khách:</b> {order.customer?.name}
                  </p>
                  <p>
                    <b>SĐT:</b> {order.customer?.phone}
                  </p>
                  <p>
                    <b>Ghi chú:</b> {order.customer?.note || "Không có"}
                  </p>
                </div>

                <div className="order-items">
                  {order.items?.map((item, index) => (
                    <div key={index}>
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <b>{formatVnd(item.price * item.quantity)}</b>
                    </div>
                  ))}
                </div>

                <div className="order-card-bottom">
                  <strong>{formatVnd(order.total)}</strong>

                  <div className="order-buttons">
                    <button onClick={() => setSelectedOrder(order)}>
                      Xem chi tiết
                    </button>

                    <button
                      onClick={() =>
                        updateOrderStatus(order.id, "Đang xử lý")
                      }
                    >
                      Đang xử lý
                    </button>

                    <button
                      className="done"
                      onClick={() => updateOrderStatus(order.id, "Hoàn tất")}
                    >
                      Hoàn tất
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {selectedOrder && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setSelectedOrder(null)}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedOrder(null)}
            >
              ×
            </button>

            <h2>Chi tiết đơn #{selectedOrder.id}</h2>

            <div className="modal-info">
              <p>
                <b>Khách hàng:</b> {selectedOrder.customer?.name}
              </p>
              <p>
                <b>Số điện thoại:</b> {selectedOrder.customer?.phone}
              </p>
              <p>
                <b>Ghi chú:</b> {selectedOrder.customer?.note || "Không có"}
              </p>
              <p>
                <b>Thời gian:</b> {selectedOrder.time || "Không có"}
              </p>
            </div>

            <h3>Sản phẩm / dịch vụ đã đặt</h3>

            <div className="modal-items">
              {selectedOrder.items?.map((item, index) => (
                <div className="modal-item" key={index}>
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <b>{formatVnd(item.price * item.quantity)}</b>
                </div>
              ))}
            </div>

            <div className="modal-total">
              Tổng tiền: {formatVnd(selectedOrder.total)}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}