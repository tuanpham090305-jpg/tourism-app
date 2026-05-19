import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = () => {
    if (password.trim() === "admin123") {
      localStorage.setItem("admin-auth", "true");
      navigate("/admin");
    } else {
      alert("Sai mật khẩu admin!");
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <h1>Admin Login</h1>
        <p>Nhập mật khẩu để vào trang quản trị.</p>

        <input
          type="password"
          placeholder="Mật khẩu admin"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") login();
          }}
        />

        <button className="primary" onClick={login}>
          Đăng nhập Admin
        </button>
      </div>
    </main>
  );
}