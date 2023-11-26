const express = require("express");
const dotenv = require("dotenv").config();
const mysql = require("mysql2/promise"); // Using promise-based MySQL
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000; // Use the specified port in the environment or default to 3000
app.use(cors());
const pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.MYUSER,
  password: process.env.PASSWD,
  database: process.env.DATABASE,
  waitForConnections: true, // Wait for available connection if the limit is reached
  connectionLimit: 10, // Maximum number of connections in the pool
  queueLimit: 0, // Unlimited queued connection requests
});
// Enable CORS for all routes
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});
app.use(express.json());

app.post("/arduino-data", async (req, res) => {
  try {
    const data = req.body.data;
    const connection = await pool.getConnection();
    await connection.changeUser({ database: process.env.DATABASE });
    const query = "INSERT INTO TempSensor(TEMP) VALUES (?)";
    const [results] = await connection.execute(query, [data]);
    connection.release();
    res.status(201).json({ result: results });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/arduino-data", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.changeUser({ database: process.env.DATABASE });
    const query = "SELECT * FROM TempSensor";
    const [results] = await connection.execute(query);
    connection.release();
    res.send({ result: results });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

module.exports = app;
