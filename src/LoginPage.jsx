import { useState } from "react";

export default function LoginPage({ onLogin, onGoRegister }) {
  const [form, setForm] = useState({
    phone: "",
    password: "",
  });

  const submit = () => {
    if (!form.phone || !form.password) {
      alert("Vui lòng nhập số điện thoại và mật khẩu!");
      return;
    }

    onLogin(form.phone, form.password);
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <h1>Đăng nhập</h1>
        <p>Đăng nhập để đặt món, thuê dịch vụ và nghe audio du lịch.</p>

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
          Đăng nhập
        </button>

        <button className="link-btn" onClick={onGoRegister}>
          Chưa có tài khoản? Đăng ký
        </button>
      </div>
    </main>
  );
}