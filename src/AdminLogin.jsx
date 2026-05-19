import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = () => {
    if (password === "admin123") {
      localStorage.setItem("admin-auth", "true");
      navigate("/admin");
    } else {
      alert("Sai mật khẩu!");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Admin Login</h1>

        <input
          type="password"
          placeholder="Nhập mật khẩu admin"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="primary" onClick={login}>
          Đăng nhập Admin
        </button>
      </div>
    </div>
  );
}