import React, { useEffect, useState } from "react";
import { API_URL } from "./config";

const formatVnd = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);

const audioPlaces = [
  { id: "a1", title: "Cầu ngắm hoàng hôn", duration: "02:45" },
  { id: "a2", title: "Làng nghề truyền thống", duration: "03:10" },
  { id: "a3", title: "Bến thuyền sinh thái", duration: "02:20" },
];

export default function Frontend({
  foods,
  services,
  allItems,
  orders,
  setOrders,
  setFoods,
  setServices,
}) {
  const [cart, setCart] = useState({});
  const [message, setMessage] = useState("");
  const [customer, setCustomer] = useState({ name: "", phone: "", note: "" });
  const [activeMenu, setActiveMenu] = useState("food");
  const [qr, setQr] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/track`, {
      method: "POST",
    }).catch(() => {});

    fetch(`${API_URL}/api/qr?url=https://tourism-app-eta.vercel.app`)
      .then((res) => res.json())
      .then((data) => setQr(data.qr))
      .catch(() => setQr(""));
  }, []);

  const cartItems = Object.entries(cart)
    .map(([id, quantity]) => ({
      ...allItems.find((item) => item.id === id),
      quantity,
    }))
    .filter((item) => item.id && item.quantity > 0);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const setQuantity = (id, quantity) => {
    setCart((prev) => ({
      ...prev,
      [id]: Math.max(0, quantity),
    }));
  };

  const submitOrder = async () => {
    if (!customer.name || !customer.phone || cartItems.length === 0) {
      setMessage("Vui lòng nhập tên, số điện thoại và chọn món/dịch vụ.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer,
          items: cartItems,
          total,
        }),
      });

      const data = await res.json();

      setMessage(`Đặt đơn thành công! Mã đơn: ${data.id}`);
      setCart({});
      setCustomer({ name: "", phone: "", note: "" });
    } catch (err) {
      console.error(err);
      setMessage("Lỗi kết nối server!");
    }
  };

  return (
    <main className="layout">
      <section>
      <div className="front-menu top-menu">
  <button
    className={activeMenu === "food" ? "active" : ""}
    onClick={() => setActiveMenu("food")}
  >
    Menu ăn uống
  </button>

  <button
    className={activeMenu === "service" ? "active" : ""}
    onClick={() => setActiveMenu("service")}
  >
    Dịch vụ thuê đồ
  </button>

  <button
    className={activeMenu === "audio" ? "active" : ""}
    onClick={() => setActiveMenu("audio")}
  >
    Audio giới thiệu
  </button>
</div>
        <div className="hero">
          <div>
            <span className="tag">QR Frontend</span>
            <h2>Đặt món, thuê dịch vụ, nghe audio du lịch</h2>
            <p>
              Khách quét QR sẽ vào giao diện này. Khi đặt đơn, backend nhận
              thông báo realtime.
            </p>
          </div>

          <div className="qr">
            {qr ? (
              <img src={qr} alt="QR Code" className="qr-img" />
            ) : (
              "Loading..."
            )}
          </div>
        </div>

        <div className="front-menu">
          <button
            className={activeMenu === "food" ? "active" : ""}
            onClick={() => setActiveMenu("food")}
          >
            Menu ăn uống
          </button>

          <button
            className={activeMenu === "service" ? "active" : ""}
            onClick={() => setActiveMenu("service")}
          >
            Dịch vụ thuê đồ
          </button>

          <button
            className={activeMenu === "audio" ? "active" : ""}
            onClick={() => setActiveMenu("audio")}
          >
            Audio giới thiệu
          </button>
        </div>

        {activeMenu === "food" && (
          <>
            <h2>Menu các quán ăn uống</h2>
            <div className="grid">
              {foods.map((item) => (
                <div className="card" key={item.id}>
                  <small>{item.category}</small>
                  <h3>{item.name}</h3>
                  <p>{formatVnd(item.price)}</p>
                  <p>Còn: {item.stock}</p>

                  <div className="qty">
                    <button
                      onClick={() =>
                        setQuantity(item.id, (cart[item.id] || 0) - 1)
                      }
                    >
                      -
                    </button>
                    <b>{cart[item.id] || 0}</b>
                    <button
                      onClick={() =>
                        setQuantity(item.id, (cart[item.id] || 0) + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeMenu === "service" && (
          <>
            <h2>Dịch vụ thuê đồ</h2>
            <div className="grid">
              {services.map((item) => (
                <div className="card" key={item.id}>
                  <small>Dịch vụ</small>
                  <h3>{item.name}</h3>
                  <p>
                    {formatVnd(item.price)} / {item.unit}
                  </p>
                  <p>Còn: {item.stock}</p>

                  <div className="qty">
                    <button
                      onClick={() =>
                        setQuantity(item.id, (cart[item.id] || 0) - 1)
                      }
                    >
                      -
                    </button>
                    <b>{cart[item.id] || 0}</b>
                    <button
                      onClick={() =>
                        setQuantity(item.id, (cart[item.id] || 0) + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeMenu === "audio" && (
          <>
            <h2>Audio giới thiệu địa điểm</h2>
            <div className="grid">
              {audioPlaces.map((audio) => (
                <div className="card" key={audio.id}>
                  <h3>{audio.title}</h3>
                  <p>Thời lượng: {audio.duration}</p>
                  <audio controls className="audio">
                    <source src="" type="audio/mpeg" />
                  </audio>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <aside className="cart">
        <h2>Giỏ đặt</h2>

        <input
          placeholder="Tên khách hàng"
          value={customer.name}
          onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
        />

        <input
          placeholder="Số điện thoại"
          value={customer.phone}
          onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
        />

        <textarea
          placeholder="Ghi chú: điểm đón, giờ đi..."
          value={customer.note}
          onChange={(e) => setCustomer({ ...customer, note: e.target.value })}
        />

        {cartItems.length === 0 ? (
          <p>Chưa chọn món/dịch vụ.</p>
        ) : (
          cartItems.map((item) => (
            <div className="line" key={item.id}>
              <span>
                {item.name} x{item.quantity}
              </span>
              <b>{formatVnd(item.price * item.quantity)}</b>
            </div>
          ))
        )}

        <div className="total">Tổng: {formatVnd(total)}</div>

        <button className="primary" onClick={submitOrder}>
          Đặt đơn
        </button>

        {message && <p className="message">{message}</p>}
      </aside>
    </main>
  );
}