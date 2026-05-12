import React from "react";
import { io } from "socket.io-client";
import { useEffect } from "react";

const formatVnd = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

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
    useEffect(() => {
  fetch("http://localhost:4000/api/orders")
    .then((res) => res.json())
    .then((data) => {
      const formatted = data.map((o) => ({
        id: o.id,
        customer: {
          name: o.customer_name,
          phone: o.phone,
          note: o.note,
        },
        items: JSON.parse(o.items),
        total: o.total,
        status: o.status,
      }));

      setOrders(formatted);
    });

  const socket = io("http://localhost:4000");

  socket.on("newOrder", (order) => {
    setOrders((prev) => [order, ...prev]);
    alert("Có đơn mới!");
  });

  return () => socket.disconnect();
}, []);
  const updateOrderStatus = (id, status) => {
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status } : order)));
  };

  const updateStock = (type, id, amount) => {
    const update = (items) =>
      items.map((item) =>
        item.id === id ? { ...item, stock: Math.max(0, item.stock + amount) } : item
      );

    type === "food" ? setFoods(update) : setServices(update);
  };

  return (
    <main className="backend">
      <div className="stats">
        <div className="card">
          <h3>Tổng đơn</h3>
          <strong>{orders.length}</strong>
        </div>

        <div className="card">
          <h3>Đơn mới realtime</h3>
          <strong>{orders.filter((o) => o.status === "Mới").length}</strong>
        </div>

        <div className="card">
          <h3>Hotline</h3>
          <strong>{siteInfo.hotline}</strong>
        </div>
      </div>

      <div className="backend-grid">
        <section className="card">
          <h2>Quản lý đơn đặt của khách hàng</h2>

          {orders.length === 0 ? (
            <p>Chưa có đơn nào.</p>
          ) : (
            orders.map((order) => (
              <div className="order" key={order.id}>
                <h3>{order.id} - {order.customer.name}</h3>
                <p>{order.customer.phone} - {order.time}</p>
                <p>Ghi chú: {order.customer.note || "Không có"}</p>

                {order.items.map((item) => (
                  <p key={item.id}>{item.name} x{item.quantity}</p>
                ))}

                <b>{formatVnd(order.total)}</b>

                <p>Trạng thái: <b>{order.status}</b></p>

                <button onClick={() => updateOrderStatus(order.id, "Đang xử lý")}>
                  Đang xử lý
                </button>

                <button onClick={() => updateOrderStatus(order.id, "Hoàn tất")}>
                  Hoàn tất
                </button>
              </div>
            ))
          )}
        </section>

        <section className="card">
          <h2>Quản lý thông tin</h2>

          <input value={siteInfo.name} onChange={(e) => setSiteInfo({ ...siteInfo, name: e.target.value })} />
          <input value={siteInfo.hotline} onChange={(e) => setSiteInfo({ ...siteInfo, hotline: e.target.value })} />
          <textarea value={siteInfo.welcome} onChange={(e) => setSiteInfo({ ...siteInfo, welcome: e.target.value })} />

          <h2>Cập nhật số lượng tồn kho</h2>

          {[...foods.map((x) => ({ ...x, type: "food" })), ...services.map((x) => ({ ...x, type: "service" }))].map((item) => (
            <div className="stock" key={item.id}>
              <span>{item.name}: <b>{item.stock}</b></span>
              <button onClick={() => updateStock(item.type, item.id, -1)}>-</button>
              <button onClick={() => updateStock(item.type, item.id, 1)}>+</button>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}