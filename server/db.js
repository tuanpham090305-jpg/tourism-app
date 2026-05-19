const sql = require("mssql");

const config = {
  user: "sa",
  password: "YOUR_PASSWORD",
  server: "localhost",
  database: "TourismDB",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

module.exports = {
  sql,
  pool,
  poolConnect,
};