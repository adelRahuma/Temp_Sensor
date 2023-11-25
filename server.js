const express = require("express");
const dotenv = require("dotenv").config();
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const port = 3000;
app.use(cors());
const pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.MYUSER,
  password: process.env.PASSWD,
  database: process.env.DATABASE,
});

app.use(express.json());
app.post("/arduino-data", (req, res) => {
  const data = req.body.data;
  //console.log(data,"data<<<<");
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error connecting to database:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    connection.changeUser({ database: process.env.DATABAS }, (err) => {
      if (err) {
        console.error("Error selecting database:", err);
        connection.release();
        res.status(500).send("Internal Server Error");
        return;
      }

      const query = "INSERT INTO TempSensor(TEMP) values(?)";
      connection.query(query, [data], (err, results) => {
        connection.release();

        if (err) {
          console.error("Error executing query:", err);
          res.status(500).send("Internal Server Error");
          return;
        }

        //console.log(results);
        res.status(200).send("Data inserted successfully");
      });
    });
  });
});
app.get("/arduino-data", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error connecting to database:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    connection.changeUser({ database: process.env.DATABAS }, (err) => {
      if (err) {
        console.error("Error selecting database:", err);
        connection.release();
        res.status(500).send("Internal Server Error");
        return;
      }

      const query = "SELECT * FROM TempSensor";
      connection.query(query, (err, results) => {
        connection.release();

        if (err) {
          console.error("Error executing query:", err);
          res.status(500).send("Internal Server Error");
          return;
        }

        //console.log(results);
        res.status(200).send({ result: results });
      });
    });
  });
});
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
module.exports = app;
