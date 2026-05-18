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
      })
      .catch((err) => console.error("Load orders error:", err));

    const socket = io(API_URL);

    socket.on("newOrder", (order) => {
      setOrders((prev) => [order, ...prev]);
      alert("Có đơn mới!");
    });

    socket.on("orderUpdated", ({ id, status }) => {
      setOrders((prev) =>
        prev.map((order) =>
          String(order.id) === String(id) ? { ...order, status } : order
        )
      );
    });

    return () => socket.disconnect();
  }, [setOrders]);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const newOrders = orders.filter((o) => o.status === "Mới").length;
    const processingOrders = orders.filter((o) => o.status === "Đang xử lý").length;
    const completedOrders = orders.filter((o) => o.status === "Hoàn tất").length;
    const revenue = orders
      .filter((o) => o.status === "Hoàn tất")
      .reduce((sum, order) => sum + Number(order.total || 0), 0);

    return {
      totalOrders,
      newOrders,
      processingOrders,
      completedOrders,
      revenue,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchStatus =
        statusFilter === "all" ? true : order.status === statusFilter;

      const keyword = search.toLowerCase().trim();
      const matchSearch =
        !keyword ||
        String(order.id).toLowerCase().includes(keyword) ||
        order.customer?.name?.toLowerCase().includes(keyword) ||
        order.customer?.phone?.toLowerCase().includes(keyword);

      return matchStatus && matchSearch;
    });
  }, [orders, statusFilter, search]);

  const updateOrderStatus = async (id, status) => {
    try {
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

      if (selectedOrder && String(selectedOrder.id) === String(id)) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (err) {
      console.error(err);
      alert("Không cập nhật được trạng thái đơn!");
    }
  };

  const updateStock = (type, id, amount) => {
    const update = (items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, stock: Math.max(0, item.stock + amount) }
          : item
      );

    type === "food" ? setFoods(update) : setServices(update);
  };

  const getStatusClass = (status) => {
    if (status === "Mới") return "status-badge status-new";
    if (status === "Đang xử lý") return "status-badge status-processing";
    if (status === "Hoàn tất") return "status-badge status-done";
    return "status-badge";
  };

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <div>
          <span className="admin-pill">Admin Dashboard</span>
          <h2>Quản trị khu du lịch</h2>
          <p>
            Theo dõi đơn đặt, doanh thu, khách hàng, thông tin khu du lịch và
            tồn kho dịch vụ trong một màn hình.
          </p>
        </div>
      </section>

      <section className="admin-stats">
        <div className="admin-stat-card">
          <span>Tổng đơn</span>
          <strong>{stats.totalOrders}</strong>
          <p>Tất cả đơn đã ghi nhận</p>
        </div>

        <div className="admin-stat-card highlight-orange">
          <span>Đơn mới</span>
          <strong>{stats.newOrders}</strong>
          <p>Cần nhân viên xử lý</p>
        </div>

        <div className="admin-stat-card highlight-blue">
          <span>Đang xử lý</span>
          <strong>{stats.processingOrders}</strong>
          <p>Đơn đang phục vụ</p>
        </div>

        <div className="admin-stat-card highlight-green">
          <span>Doanh thu hoàn tất</span>
          <strong>{formatVnd(stats.revenue)}</strong>
          <p>Tính theo đơn hoàn tất</p>
        </div>
      </section>

      <section className="admin-layout">
        <div className="admin-main-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Quản lý đơn đặt</h2>
              <p>Danh sách đơn realtime từ khách hàng</p>
            </div>

            <input
              className="admin-search"
              placeholder="Tìm mã đơn, tên, số điện thoại..."
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

          <div className="admin-table">
            <div className="admin-table-head">
              <span>Mã đơn</span>
              <span>Khách</span>
              <span>Tổng tiền</span>
              <span>Trạng thái</span>
              <span>Thao tác</span>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="admin-empty">Chưa có đơn phù hợp.</div>
            ) : (
              filteredOrders.map((order) => (
                <div className="admin-table-row" key={order.id}>
                  <span>#{order.id}</span>

                  <span>
                    <b>{order.customer?.name || "Khách hàng"}</b>
                    <small>{order.customer?.phone}</small>
                  </span>

                  <span>{formatVnd(order.total)}</span>

                  <span>
                    <b className={getStatusClass(order.status)}>
                      {order.status}
                    </b>
                  </span>

                  <span className="admin-actions">
                    <button onClick={() => setSelectedOrder(order)}>
                      Chi tiết
                    </button>

                    {order.status !== "Đang xử lý" && (
                      <button
                        onClick={() =>
                          updateOrderStatus(order.id, "Đang xử lý")
                        }
                      >
                        Xử lý
                      </button>
                    )}

                    {order.status !== "Hoàn tất" && (
                      <button
                        className="done"
                        onClick={() => updateOrderStatus(order.id, "Hoàn tất")}
                      >
                        Hoàn tất
                      </button>
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <aside className="admin-side-panel">
          <div className="admin-card">
            <h2>Quản lý thông tin</h2>

            <label>Tên khu du lịch</label>
            <input
              value={siteInfo.name}
              onChange={(e) =>
                setSiteInfo({ ...siteInfo, name: e.target.value })
              }
            />

            <label>Hotline</label>
            <input
              value={siteInfo.hotline}
              onChange={(e) =>
                setSiteInfo({ ...siteInfo, hotline: e.target.value })
              }
            />

            <label>Lời chào</label>
            <textarea
              value={siteInfo.welcome}
              onChange={(e) =>
                setSiteInfo({ ...siteInfo, welcome: e.target.value })
              }
            />
          </div>

          <div className="admin-card">
            <h2>Tồn kho hiện tại</h2>

            {[...foods.map((x) => ({ ...x, type: "food" })), ...services.map((x) => ({ ...x, type: "service" }))].map(
              (item) => (
                <div className="admin-stock-item" key={item.id}>
                  <div>
                    <b>{item.name}</b>
                    <small>Còn {item.stock}</small>
                  </div>

                  <div>
                    <button onClick={() => updateStock(item.type, item.id, -1)}>
                      -
                    </button>
                    <button onClick={() => updateStock(item.type, item.id, 1)}>
                      +
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </aside>
      </section>

      {selectedOrder && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedOrder(null)}>
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
              <p>
                <b>Trạng thái:</b>{" "}
                <span className={getStatusClass(selectedOrder.status)}>
                  {selectedOrder.status}
                </span>
              </p>
            </div>

            <h3>Sản phẩm / dịch vụ</h3>

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

            <div className="modal-actions">
              <button
                onClick={() =>
                  updateOrderStatus(selectedOrder.id, "Đang xử lý")
                }
              >
                Chuyển sang đang xử lý
              </button>

              <button
                className="done"
                onClick={() => updateOrderStatus(selectedOrder.id, "Hoàn tất")}
              >
                Hoàn tất đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}