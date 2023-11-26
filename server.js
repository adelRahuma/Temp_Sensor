const express = require("express");
const dotenv = require("dotenv").config();
const mysql = require("mysql2/promise"); // Using promise-based MySQL
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3000; // Use the specified port in the environment or default to 3000
app.use(
  cors({
    origin: "https://your-allowed-origin.com",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

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
app.use(bodyParser.json());
const temperatureData = [
  { ID: 1, TEMP: "12.34" },
  { ID: 2, TEMP: "22.56" },
  // ... other data
];
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
app.get("/dd", (req, res) => {
  res.send({ data: temperatureData });
});
app.get("/data", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.changeUser({ database: process.env.DATABASE });
    const query = "SELECT * FROM TempSensor";
    const [results] = await connection.execute(query);
    connection.release();
    res.send(results);
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

module.exports = app;
