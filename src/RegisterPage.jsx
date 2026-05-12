import { useState } from "react";

export default function RegisterPage({ onRegister, onGoLogin }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
  });

  const submit = () => {
    if (!form.name || !form.phone || !form.password) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    onRegister(form);
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <h1>Đăng ký</h1>
        <p>Tạo tài khoản khách hàng để sử dụng dịch vụ du lịch.</p>

        <input
          placeholder="Họ và tên"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

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
          Đăng ký
        </button>

        <button className="link-btn" onClick={onGoLogin}>
          Đã có tài khoản? Đăng nhập
        </button>
      </div>
    </main>
  );
}