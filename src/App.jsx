import React, { useMemo, useState } from "react";
import "./App.css";
import Frontend from "./Frontend.jsx";
import Backend from "./Backend.jsx";
import AuthPage from "./AuthPage.jsx";
import LoginPage from "./LoginPage.jsx";
import RegisterPage from "./RegisterPage.jsx";
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
  const [page, setPage] = useState("frontend");
  const [foods, setFoods] = useState(initialFoods);
  const [services, setServices] = useState(initialServices);
  const [orders, setOrders] = useState([]);
  const [authMode, setAuthMode] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [clickCount, setClickCount] = useState(0);
  const [authPage, setAuthPage] = useState("login");

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
  const handleRegister = (user) => {
  setUsers([...users, user]);
  setCurrentUser(user);
};

const handleLogin = (phone, password) => {
  const found = users.find(
    (u) => u.phone === phone && u.password === password
  );

  if (found) {
    setCurrentUser(found);
  } else {
    alert("Sai số điện thoại hoặc mật khẩu!");
  }
};

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1
  onClick={() => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount === 5) {
      const password = prompt("Nhập mật khẩu admin:");

      if (password === "admin123") {
        setPage("backend");
      } else {
        alert("Sai mật khẩu!");
      }

      setClickCount(0);
    }
  }}
  style={{ cursor: "pointer" }}
>
  {siteInfo.name}
</h1>
          <p>{siteInfo.welcome}</p>
        </div>
      </header>
      
      {!currentUser ? (
  authPage === "login" ? (
    <LoginPage
      onLogin={handleLogin}
      onGoRegister={() => setAuthPage("register")}
    />
  ) : (
    <RegisterPage
      onRegister={handleRegister}
      onGoLogin={() => setAuthPage("login")}
    />
  )
      ) : page === "frontend" ? (
        <Frontend
          foods={foods}
          services={services}
          allItems={allItems}
          orders={orders}
          setOrders={setOrders}
          setFoods={setFoods}
          setServices={setServices}
        />
      ) : (
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
      )}
    </div>
  );
}