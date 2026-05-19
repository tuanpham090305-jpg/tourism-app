import React, { useMemo, useState } from "react";
import "./App.css";
import Frontend from "./Frontend.jsx";
import Backend from "./Backend.jsx";
import AdminLogin from "./AdminLogin.jsx";
import { Routes, Route, Navigate } from "react-router-dom";

const initialFoods = [
  { id: "f1", name: "Bún hải sản", price: 65000, category: "Món ăn", stock: 35 },
  { id: "f2", name: "Cơm gà", price: 55000, category: "Món ăn", stock: 28 },
  { id: "f3", name: "Nước dừa", price: 25000, category: "Đồ uống", stock: 60 },
  { id: "f4", name: "Cà phê muối", price: 35000, category: "Đồ uống", stock: 45 },
];

const initialServices = [
  { id: "s1", name: "Xe điện tham quan", price: 120000, unit: "chuyến", stock: 8 },
  { id: "s2", name: "Thuyền ngắm cảnh", price: 250000, unit: "lượt", stock: 5 },
  { id: "s3", name: "Áo phao", price: 20000, unit: "cái", stock: 40 },
];

export default function App() {
  const [foods, setFoods] = useState(initialFoods);
  const [services, setServices] = useState(initialServices);
  const [orders, setOrders] = useState([]);

  const [siteInfo, setSiteInfo] = useState({
    name: "Khu du lịch Sông Xanh",
    hotline: "0900 123 456",
    welcome: "Quét QR để đặt món, thuê dịch vụ và nghe thuyết minh tự động.",
  });

  const allItems = useMemo(
    () => [
      ...foods.map((x) => ({ ...x, type: "food" })),
      ...services.map((x) => ({ ...x, type: "service" })),
    ],
    [foods, services]
  );

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Frontend
            foods={foods}
            services={services}
            allItems={allItems}
            orders={orders}
            setOrders={setOrders}
            setFoods={setFoods}
            setServices={setServices}
          />
        }
      />

      <Route path="/admin-login" element={<AdminLogin />} />

      <Route
        path="/admin"
        element={
          localStorage.getItem("admin-auth") === "true" ? (
            <Backend
              foods={foods}
              services={services}
              orders={orders}
              setOrders={setOrders}
              setFoods={setFoods}
              setServices={setServices}
              siteInfo={siteInfo}
              setSiteInfo={setSiteInfo}
            />
          ) : (
            <Navigate to="/admin-login" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}