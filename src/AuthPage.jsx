import { useState } from "react";

export default function AuthPage({ mode, setMode, onLogin, onRegister }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
  });

  const submit = () => {
    if (mode === "register") {
      if (!form.name || !form.phone || !form.password) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
      }
      onRegister(form);
    } else {
      if (!form.phone || !form.password) {
        alert("Vui lòng nhập số điện thoại và mật khẩu!");
        return;
      }
      onLogin(form.phone, form.password);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h2>{mode === "login" ? "Đăng nhập khách hàng" : "Đăng ký khách hàng"}</h2>
        <p>Đăng nhập để đặt món, thuê dịch vụ và nghe audio du lịch.</p>

        {mode === "register" && (
          <input
            placeholder="Họ và tên"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        )}

        <input
          placeholder="Số điện thoại"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button className="primary" onClick={submit}>
          {mode === "login" ? "Đăng nhập" : "Đăng ký"}
        </button>

        <button
          className="link-btn"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login"
            ? "Chưa có tài khoản? Đăng ký"
            : "Đã có tài khoản? Đăng nhập"}
        </button>
      </div>
    </main>
  );
}