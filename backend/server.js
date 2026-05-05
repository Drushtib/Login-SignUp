const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ GLOBAL DB VARIABLE
let db;

// MySQL Connection with retry
function connectDB() {
  db = mysql.createConnection({
    host: process.env.DB_HOST || "mysql-container",
    user: "root",
    password: "root",
    database: "auth_db",
  });

  db.connect((err) => {
    if (err) {
      console.log("❌ DB Error:", err);
      setTimeout(connectDB, 5000); // retry
    } else {
      console.log("✅ Connected to MySQL");
    }
  });
}

connectDB();


// ================== SIGNUP ==================
app.post("/signup", async (req, res) => {
  const { name, mobile, email, password } = req.body;

  if (!name || !mobile || !email || !password) {
    return res.status(400).send("All fields are required");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql =
      "INSERT INTO users (name, mobile, email, password) VALUES (?, ?, ?, ?)";

    db.query(sql, [name, mobile, email, hashedPassword], (err, result) => {
      if (err) {
        console.log("❌ SQL Error:", err);
        return res.status(500).send(err.message);
      }

      res.send("Signup successful");
    });
  } catch (err) {
    console.log("❌ Server Error:", err);
    res.status(500).send("Server error");
  }
});


// ================== LOGIN ==================
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("All fields required");
  }

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, result) => {
    if (err) {
      console.log("❌ DB Error:", err);
      return res.status(500).send("DB error");
    }

    if (result.length === 0) {
      return res.status(400).send("User not found");
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).send("Invalid password");
    }

    res.send("Login successful");
  });
});


// ================== SERVER ==================
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});