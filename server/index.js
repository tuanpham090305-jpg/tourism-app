const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const sqlite3 = require("sqlite3").verbose();
const QRCode = require("qrcode");

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "https://tourism-app-khzp.vercel.app",
  "https://tourism-app-eta.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

const db = new sqlite3.Database("./tourism.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT,
      phone TEXT,
      note TEXT,
      items TEXT,
      total INTEGER,
      status TEXT DEFAULT 'Mới',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS visitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip TEXT,
      user_agent TEXT,
      visited_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

app.get("/", (req, res) => {
  res.json({
    message: "Tourism backend is running",
    status: "OK",
  });
});

app.post("/api/track", (req, res) => {
  db.run(
    "INSERT INTO visitors (ip, user_agent) VALUES (?, ?)",
    [req.ip, req.headers["user-agent"] || ""],
    (err) => {
      if (err) {
        return res.status(500).json({ error: "Không lưu được lượt truy cập" });
      }

      res.json({ success: true });
    }
  );
});

app.post("/api/orders", (req, res) => {
  const { customer, items, total } = req.body;

  if (!customer || !customer.name || !customer.phone || !items?.length) {
    return res.status(400).json({
      error: "Thiếu thông tin khách hàng hoặc đơn hàng",
    });
  }

  db.run(
    `INSERT INTO orders (customer_name, phone, note, items, total, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      customer.name,
      customer.phone,
      customer.note || "",
      JSON.stringify(items),
      total || 0,
      "Mới",
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Không tạo được đơn hàng" });
      }

      const order = {
        id: this.lastID,
        customer,
        items,
        total,
        status: "Mới",
        time: new Date().toISOString(),
      };

      io.emit("newOrder", order);
      res.json(order);
    }
  );
});

app.get("/api/orders", (req, res) => {
  db.all("SELECT * FROM orders ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Không lấy được danh sách đơn" });
    }

    res.json(rows);
  });
});

app.patch("/api/orders/:id", (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Thiếu trạng thái đơn hàng" });
  }

  db.run(
    "UPDATE orders SET status = ? WHERE id = ?",
    [status, req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Không cập nhật được đơn" });
      }

      io.emit("orderUpdated", {
        id: req.params.id,
        status,
      });

      res.json({ success: true });
    }
  );
});

app.get("/api/visitors", (req, res) => {
  db.all("SELECT * FROM visitors ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Không lấy được lượt truy cập" });
    }

    res.json(rows);
  });
});

app.get("/api/qr", async (req, res) => {
  try {
    const url = req.query.url || "https://tourism-app-khzp.vercel.app";
    const qr = await QRCode.toDataURL(url);
    res.json({ qr });
  } catch (err) {
    res.status(500).json({ error: "Không tạo được QR" });
  }
});

io.on("connection", () => {
  console.log("Admin connected realtime");
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Backend chạy tại port ${PORT}`);
});