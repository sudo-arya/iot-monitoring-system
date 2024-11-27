const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
require("dotenv").config(); // Load environment variables
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Initialize Express
const app = express();
app.use(bodyParser.json()); // To handle JSON request body
const JWT_SECRET = `${process.env.JWT_SECRET_KEY}`;

// MySQL connection setup using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST, // Database host
  user: process.env.DB_USER, // Database username
  password: process.env.DB_PASSWORD, // Database password
  database: process.env.DB_NAME, // Database name
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the MySQL database");
});



// app.post("/login", (req, res) => {
//   const { email, password } = req.body;
// // console.log("got data");
//   const query = "SELECT * FROM users_data WHERE email_id = ? AND password = ?";
//   db.query(query, [email, password], (err, results) => {
//     if (err) {
//       console.error("Error during database query:", err);
//       return res.status(500).send("Internal server error");
//     }

//     if (results.length > 0) {
//       res.status(200).json({ message: "Login successful", user: results[0] });
//     } else {
//       res.status(401).json({ message: "Invalid email or password" });
//     }
//   });
// });


app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Query to find user by email
  const query = "SELECT * FROM users_data WHERE email_id = ?";
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).send("Internal server error");
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0];

    // Check if the user is allowed to log in
    if (user.status !== "allowed") {
      // Log failed login attempt (status not allowed)
      const logQuery = `
      INSERT INTO log_data (log_type, log_message, timestamp) 
      VALUES (?, ?, NOW())
      `;
      const logMessage = `Login not allowed for email (${email}), User ID: ${user.user_id}`;
      db.query(logQuery, ["Login Blocked", logMessage], (logErr) => {
        if (logErr) {
          console.error(
            "Failed to create log entry for blocked login attempt:",
            logErr
          );
        }
      });

      return res
        .status(403)
        .json({ message: "Login not allowed for this user" });
    }

    // Compare provided password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Log failed login attempt (invalid password)
      const logQuery = `
      INSERT INTO log_data (log_type, log_message, timestamp) 
      VALUES (?, ?, NOW())
      `;
      const logMessage = `Failed login attempt: Incorrect password for email (${email}), User ID: ${user.user_id}`;
      db.query(logQuery, ["Login Failed", logMessage], (logErr) => {
        if (logErr) {
          console.error(
            "Failed to create log entry for incorrect password:",
            logErr
          );
        }
      });

      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      JWT_SECRET,
      { expiresIn: "10h" } // Token expiration time
    );

    const locationQuery = `SELECT pi_id, pi_location, pi_status, latitude, longitude FROM ${user.user_id}_pi_table`;
    db.query(locationQuery, (locErr, locResults) => {
      if (locErr) {
        console.error("Location query error:", locErr);
        return res
          .status(500)
          .json({ message: "Error fetching location data" });
      }

      const locationData = locResults.map((row) => ({
        piId:row.pi_id,
        piLocation:row.pi_location,
        piStatus:row.pi_status,
        latitude: row.latitude,
        longitude: row.longitude,
      }));
      // console.log(locationData);
      // Create log entry in the logs table
      const logQuery = `
      INSERT INTO log_data (log_type, log_message, timestamp) 
      VALUES (?, ?, NOW())
    `;
      const logMessage = `User logged in: ID=${user.user_id}, Name=${user.user_name}, Role=${user.role}`;

      db.query(
        logQuery,
        ["Login Detected", logMessage],
        (logErr, logResults) => {
          if (logErr) {
            console.error("Failed to create log entry:", logErr);
          }
        }
      );

      // Respond with token and user info
      res.status(200).json({
        message: "Login successful",
        token,
        user: { userId: user.user_id, role: user.role, name: user.user_name },
        locations: locationData,
      });
    });
  });
});


























// ignore this one



// Route to handle sensor data
app.post("/sensorValue", (req, res) => {
  const { sensorData } = req.body;

  // Parse the sensor data from the request
  try {
    const data = parseSensorData(sensorData);

    // Log the parsed data to the console
    console.log("Received Sensor Data:", data);

    // Insert the data into the MySQL database
    const sql = `INSERT INTO SensorData (temperature, pressure, humidity, airQuality, mqTwo, room) VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [
      data.temperature,
      data.pressure,
      data.humidity,
      data.airQuality,
      data.mqTwo,
      data.room,
    ];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error inserting data into the database:", err);
        return res.status(500).send("Error saving data");
      }
      console.log("Data inserted successfully:", result);
      res.send("Data received and stored successfully");
    });
  } catch (error) {
    console.error("Error parsing sensor data:", error);
    res.status(400).send("Invalid sensor data format");
  }
});

// Helper function to parse sensor data
function parseSensorData(sensorData) {
  // Split the incoming sensor data string by "_"
  const dataParts = sensorData.split("_");

  // Ensure the length of dataParts is as expected
  if (dataParts.length < 6) {
    throw new Error("Invalid sensor data format");
  }

  // Create a mapping object
  const parsedData = {};

  // Loop through data parts, handling the last element separately
  for (let i = 0; i < dataParts.length; i++) {
    const key = dataParts[i].toLowerCase(); // Convert key to lowercase for consistency
    if (i === dataParts.length - 1) {
      // If it's the last element (room)
      parsedData.room = key.split("_")[1]; // Get the room number
    } else {
      const value = parseFloat(dataParts[i + 1]); // Parse the next value as float
      parsedData[key] = !isNaN(value) ? value : null; // Handle NaN values
      i++; // Skip the next index since it's the value
    }
  }

  return {
    temperature: parsedData["temp"],
    pressure: parsedData["pressure"],
    humidity: parsedData["humidity"],
    airQuality: parsedData["airqual"],
    mqTwo: parsedData["mqtwo"],
    room: parsedData.room, // Correctly assigned room number
  };
}




// till here

// Start the server
const PORT = process.env.PORT || 5000; // Use the PORT variable from .env or default to 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
