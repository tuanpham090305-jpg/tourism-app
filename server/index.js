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
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  },
});
app.use(express.json());

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

app.post("/api/track", (req, res) => {
  db.run(
    "INSERT INTO visitors (ip, user_agent) VALUES (?, ?)",
    [req.ip, req.headers["user-agent"]],
    () => res.json({ success: true })
  );
});

app.post("/api/orders", (req, res) => {
  const { customer, items, total } = req.body;

  db.run(
    `INSERT INTO orders (customer_name, phone, note, items, total, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      customer.name,
      customer.phone,
      customer.note,
      JSON.stringify(items),
      total,
      "Mới",
    ],
    function () {
      const order = {
        id: this.lastID,
        customer,
        items,
        total,
        status: "Mới",
      };

      io.emit("newOrder", order);
      res.json(order);
    }
  );
});

app.get("/api/orders", (req, res) => {
  db.all("SELECT * FROM orders ORDER BY id DESC", [], (err, rows) => {
    res.json(rows);
  });
});

app.patch("/api/orders/:id", (req, res) => {
  const { status } = req.body;

  db.run(
    "UPDATE orders SET status = ? WHERE id = ?",
    [status, req.params.id],
    () => {
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
    res.json(rows);
  });
});

app.get("/api/qr", async (req, res) => {
  const url = req.query.url || "http://localhost:5173";
  const qr = await QRCode.toDataURL(url);
  res.json({ qr });
});

io.on("connection", () => {
  console.log("Admin connected realtime");
});

server.listen(4000, () => {
  console.log("https://tourism-app-production-bc95.up.railway.app");
});