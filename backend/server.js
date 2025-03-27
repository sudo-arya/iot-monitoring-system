const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
require("dotenv").config(); // Load environment variables
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
// const WebSocket = require("ws");
const cors = require("cors");


// Initialize Express
const app = express();
// Enable CORS for all routes
app.use(cors());

// If you want to restrict CORS to only certain origins, you can specify that:
app.use(
  cors({
    origin: [
      "http://localhost:3000" // Allow requests from React app on localhost
      // "http://192.168.1.100:3000", // Replace with your local IP
    ],
    methods: ["GET", "POST"], // Specify allowed methods
  })
);
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

// SSE Middleware
// function sseMiddleware(req, res, next) {
//     res.sseSetup = () => {
//         res.writeHead(200, {
//             "Content-Type": "text/event-stream",
//             "Cache-Control": "no-cache",
//             "Connection": "keep-alive"
//         });
//     };

//     res.sseSend = (data) => {
//         res.write(`data: ${JSON.stringify(data)}\n\n`);
//     };

//     next();
// }

// app.use(sseMiddleware);

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

// const server = app.listen(3001, () => {
//   console.log("Server listening on port 3000");
// });

// const wss = new WebSocket.Server({ server });

// // Function to handle the WebSocket connection
// wss.on("connection", (ws, req) => {
//   const { user_id, sensor_id } = req.url
//     .split("?")
//     .pop()
//     .split("&")
//     .map((param) => param.split("="))
//     .reduce((acc, [key, value]) => {
//       acc[key] = value;
//       return acc;
//     }, {}); // Parse URL parameters

//   if (!user_id || !sensor_id) {
//     ws.send(JSON.stringify({ error: "user_id and sensor_id are required" }));
//     ws.close();
//     return;
//   }

//   console.log(
//     `New WebSocket connection for userId: ${user_id}, sensorId: ${sensor_id}`
//   );

//   // Set up the table name dynamically based on user_id
//   const tableName = `${user_id}_sensors_data`;

//   // Function to query the latest sensor data
//   const getSensorData = () => {
//     return new Promise((resolve, reject) => {
//       const query = `
//         SELECT timestamp, sensor_value, sensor_status
//         FROM ??
//         WHERE sensor_id = ?
//         ORDER BY timestamp DESC
//         LIMIT 25
//       `;

//       db.query(query, [tableName, sensor_id], (err, results) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(results);
//         }
//       });
//     });
//   };

//   // Function to send data over WebSocket
//   const sendData = (data) => {
//     ws.send(JSON.stringify(data));
//   };

//   // Query and send initial data
//   getSensorData()
//     .then((data) => {
//       sendData(data); // Send initial data

//       // Set interval to send updated data every 5 seconds
//       const intervalId = setInterval(() => {
//         getSensorData()
//           .then((data) => {
//             sendData(data);
//           })
//           .catch((err) => {
//             console.error(err);
//             clearInterval(intervalId);
//             ws.close();
//           });
//       }, 5000);

//       // Cleanup when the WebSocket connection is closed
//       ws.on("close", () => {
//         console.log("Client disconnected. Cleaning up WebSocket connection.");
//         clearInterval(intervalId);
//       });
//     })
//     .catch((err) => {
//       console.error("Database query failed:", err);
//       ws.send(JSON.stringify({ error: "Database query failed" }));
//       ws.close();
//     });
// });




// SSE Middleware (Optional - If you prefer to use a middleware for setting headers)
function sseMiddleware(req, res, next) {
  res.sseSetup = () => {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    });
  };

  res.sseSend = (data) => {
    try {
      const jsonData = JSON.stringify(data); // Ensure data is serialized as JSON
      res.write(`data: ${jsonData}\n\n`);
    } catch (err) {
      console.error("Error serializing data:", err);
    }
  };

  next();
}

app.use(sseMiddleware);

// SSE Route to stream sensor data
app.get("/get-latest-sensor-data", async (req, res) => {
  const { user_id, sensor_id } = req.query;

  if (!user_id || !sensor_id) {
    return res.status(400).json({ error: "user_id and sensor_id are required" });
  }

  // Set up the response for SSE
  res.sseSetup();
  console.log("SSE connection started for user:", user_id, "sensor:", sensor_id);

  const tableName = `${user_id}_sensors_data`;
  let lastSentData = null; // Track the last sent data to avoid sending duplicates

  // Function to send data in SSE format
  const sendData = (data) => {
    // Check if the new data differs from the last sent data
    if (JSON.stringify(data) !== lastSentData) {
      res.sseSend(data); // Send the data using the sseSend method
      lastSentData = JSON.stringify(data); // Store the last sent data
    }
  };

  // Query to get the latest sensor data
  const getSensorData = () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT timestamp, sensor_value, sensor_status
        FROM ??
        WHERE sensor_id = ?
        ORDER BY timestamp DESC
        LIMIT 500
      `;

      db.query(query, [tableName, sensor_id], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
          // console.log(results);
        }
      });
    });
  };

  try {
    const data = await getSensorData();
    sendData(data); // Send initial data

    // Set interval to send updated data every 5 seconds
    const intervalId = setInterval(async () => {
      try {
        const data = await getSensorData();
        sendData(data); // Send updated data if there is new data
      } catch (err) {
        console.error("Error fetching sensor data:", err);
        clearInterval(intervalId); // Stop the interval on error
        res.end(); // Close the response on error
      }
    }, 5000);

    // Cleanup when the connection is closed or client stops listening
    req.on("close", () => {
      console.log("Client disconnected. Cleaning up SSE connection.");
      clearInterval(intervalId); // Clear the interval on disconnect
      res.end(); // End the SSE connection
    });
  } catch (err) {
    console.error("Database query failed:", err);
    res.status(500).json({ error: "Database query failed" });
    res.end();
  }
});


app.get("/get-latest-sensors-for-pi", async (req, res) => {
  const { user_id, pi_id } = req.query;

  if (!user_id || !pi_id) {
    return res.status(400).json({ error: "user_id and pi_id are required" });
  }

  // Set up SSE response
  res.sseSetup();
  console.log("SSE connection started for user:", user_id, "pi_id:", pi_id);

  const sensorsTableName = `${user_id}_sensors_table`; // Table for sensor metadata
  const sensorDataTableName = `${user_id}_sensors_data`; // Table for sensor data
  let lastSentData = null; // Track the last sent data to avoid duplicates

  // Helper function to send data only if new/updated
  const sendData = (data) => {
    const dataString = JSON.stringify(data);
    if (dataString !== lastSentData) {
      res.sseSend(data); // Send the data
      lastSentData = dataString; // Update last sent data
      // console.log(lastSentData);
    }
  };

  // Function to fetch the latest sensor values for the given `pi_id`
  const getLatestSensorValues = () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT
          st.sensor_id,          -- Sensor ID
          st.sensor_type,        -- Sensor Type (e.g., temperature, humidity)
          st.sensor_unit,        -- Unit of measurement (e.g., °C, %)
          sd.sensor_value,       -- Latest sensor value
          sd.timestamp,          -- Timestamp of the reading
          sd.sensor_status       -- Status of the sensor (e.g., active, error)
        FROM
          ?? AS st               -- Sensor metadata table
        INNER JOIN
          (
            SELECT sensor_id, MAX(timestamp) AS latest_timestamp
            FROM ??              -- Sensor data table
            WHERE pi_id = ?
            GROUP BY sensor_id   -- Group by sensor to get the latest timestamp
          ) AS latest_data
        ON st.sensor_id = latest_data.sensor_id
        INNER JOIN ?? AS sd      -- Join on sensor data table
        ON sd.sensor_id = latest_data.sensor_id AND sd.timestamp = latest_data.latest_timestamp
        WHERE st.pi_id = ?
        ORDER BY sd.timestamp DESC -- Sort by the most recent readings
      `;

      db.query(
        query,
        [sensorsTableName, sensorDataTableName, pi_id, sensorDataTableName, pi_id],
        (err, results) => {
          if (err) {
            reject(err); // Reject on error
          } else {
            resolve(results); // Resolve with query results
          }
        }
      );
    });
  };

  try {
    // Fetch and send initial data
    const data = await getLatestSensorValues();
    sendData(data);

    // Set up periodic updates every 5 seconds
    const intervalId = setInterval(async () => {
      try {
        const updatedData = await getLatestSensorValues();
        sendData(updatedData);
      } catch (err) {
        console.error("Error fetching sensor data:", err);
        clearInterval(intervalId); // Stop updates on error
        res.end(); // End the SSE connection
      }
    }, 5000);

    // Clean up when the client disconnects
    req.on("close", () => {
      console.log("Client disconnected. Cleaning up SSE connection.");
      clearInterval(intervalId);
      res.end();
    });
  } catch (err) {
    console.error("Error setting up SSE:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});


// SSE endpoint to get alerts by user_id
app.get('/get-alerts-for-user', (req, res) => {
  const { user_id } = req.query;

  // Validate user_id input
  if (!user_id) {
    return res.status(400).send('User ID is required');
  }

  // Log when a connection is established
  console.log(`SSE connection established for user_id: ${user_id} showing alerts`);

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Query the database for alerts
  const query = `SELECT alert_type, alert_message, alert_status, timestamp
                 FROM ${user_id}_alert_data`; // Assuming pi_id is related to the user_id

  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).send('Error querying the database');
    }

    if (results.length > 0) {
      // Send the results as SSE messages
      results.forEach((alert) => {
        const data = {
          alert_type: alert.alert_type,
          alert_message: alert.alert_message,
          alert_status: alert.alert_status,
          timestamp: alert.timestamp,
        };

        res.write(`data: ${JSON.stringify(data)}\n\n`);
      });
    } else {
      res.write(`data: {"message": "No alerts found for this user."}\n\n`);
    }

    // Keep the SSE connection alive
    setInterval(() => {
      res.write(':\n\n'); // Keep connection alive by sending empty data
    }, 10000);
  });

  // Log when the SSE connection is closed or disconnected
  req.on('close', () => {
    console.log(`SSE connection closed for user_id: ${user_id} for alerts`);
  });
});




// Endpoint to fetch available sensors for the given pi_id
app.get('/get-sensor-data', (req, res) => {
    const { user_id, pi_id } = req.query;

    if (!user_id || !pi_id) {
        return res.status(400).send({ error: 'user_id and pi_id are required' });
    }

    // Step 1: Fetch available sensors with required fields for the provided pi_id
    const sensorsTable = `${user_id}_sensors_table`;

    const query = `
        SELECT s.sensor_id, s.sensor_type, s.min_sensor_value, s.max_sensor_value, s.sensor_unit
        FROM ${sensorsTable} s
        WHERE s.pi_id = ?;
    `;

    db.query(query, [pi_id], (err, sensors) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ error: 'Database query failed' });
        }

        if (!sensors.length) {
            return res.status(404).send({ error: 'No sensors found for the given pi_id' });
        }

        // Step 2: Return the list of available sensors
        return res.status(200).send(sensors);
    });
});





// irrrigation managenent and control apis
// SSE endpoint to get the current irrigation status
app.get('/current-irrigation-status', (req, res) => {
  const { user_id } = req.query;

  // Validate input
  if (!user_id) {
    return res.status(400).send('User ID is required');
  }

  console.log(`SSE connection established for user_id: ${user_id} - Monitoring irrigation status`);

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // To store the last sent data
  let lastSentData = null;

  const sendIrrigationStatus = () => {
    const query = `SELECT actuator_id, actuator_name, actuator_location, min_actuator_value,
                          max_actuator_value, actuator_status, time,after
                   FROM ${user_id}_actuator_table`;

    db.query(query, [user_id], (err, results) => {
      if (err) {
        console.error('Error querying the database:', err);
        res.write(`data: {"error": "Error querying the database"}\n\n`);
        return;
      }

      // If there are results, compare with last sent data
      if (results.length > 0) {
        const dataToSend = results.map((actuator) => ({
          actuator_id: actuator.actuator_id,
          actuator_name: actuator.actuator_name,
          actuator_location: actuator.actuator_location,
          min_actuator_value: actuator.min_actuator_value,
          max_actuator_value: actuator.max_actuator_value,
          actuator_status:actuator.actuator_status,
          time: actuator.time,
          after:actuator.after,
        }));

        // Check if the current data differs from the last sent data
        if (JSON.stringify(dataToSend) !== JSON.stringify(lastSentData)) {
          // Send the new data to the client
          res.write(`data: ${JSON.stringify(dataToSend)}\n\n`);
          lastSentData = dataToSend; // Update last sent data
        }
      } else {
        // If no results, clear the last sent data
        if (lastSentData !== null) {
          res.write(`data: {"message": "No active actuators found for this user"}\n\n`);
          lastSentData = null; // Update last sent data
        }
      }
    });
  };

  // Send initial irrigation status
  sendIrrigationStatus();

  // Keep the connection alive with regular updates
  const interval = setInterval(() => {
    sendIrrigationStatus();
  }, 10000); // Update every 10 seconds

  // Cleanup when the connection closes
  req.on('close', () => {
    console.log(`SSE connection closed for user_id: ${user_id}`);
    clearInterval(interval);
  });
});

// Endpoint to fetch actuators for a given user_id and selected pi_id
app.get('/get-actuators', (req, res) => {
  const { user_id, pi_id } = req.query;

  // Validate inputs
  if (!user_id || !pi_id) {
    return res.status(400).json({ error: 'User ID and PI ID are required' });
  }

  console.log(`Fetching actuators for user_id: ${user_id} and pi_id: ${pi_id}`);

  // Query to get actuators for the specified user_id and pi_id
  const query = `
    SELECT actuator_id, actuator_name, actuator_location, min_actuator_value,
           max_actuator_value, actuator_status, time, created_at, updated_at
    FROM ${user_id}_actuator_table
    WHERE pi_id = ?
  `;

  db.query(query, [pi_id], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ error: 'Error querying the database' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No actuators found for the specified PI ID' });
    }

    // Prepare the response
    const response = results.map((actuatorsList) => ({
      actuator_id: actuatorsList.actuator_id,
      actuator_name: actuatorsList.actuator_name,
      actuator_location: actuatorsList.actuator_location,
      min_actuator_value: actuatorsList.min_actuator_value,
      max_actuator_value: actuatorsList.max_actuator_value,
      actuator_status: actuatorsList.actuator_status,
      time: actuatorsList.time,
      created_at: actuatorsList.created_at,
      updated_at: actuatorsList.updated_at,
    }));

    // Send the response
    res.status(200).json(response);
  });
});

// Endpoint to insert or update actuator data
app.post('/actuator-mode', (req, res) => {
  const { user_id, actuator_id, min_actuator_value, max_actuator_value, actuator_status, time, after } = req.body;

  if (!user_id || !actuator_id) {
    return res.status(400).json({ error: 'User ID and Actuator ID are required' });
  }

  console.log(`Processing actuator data for user_id: ${user_id}, actuator_id: ${actuator_id}`);

  const defaultValues = {
    min_actuator_value: 0,
    max_actuator_value: 0,
    actuator_status: 'inactive',
    time: 0,
    after: new Date(),
    updated_at: new Date()
  };

  const newData = {
    min_actuator_value: min_actuator_value ?? defaultValues.min_actuator_value,
    max_actuator_value: max_actuator_value ?? defaultValues.max_actuator_value,
    actuator_status: actuator_status ?? defaultValues.actuator_status,
    time: time ?? defaultValues.time,
    after: after ?? defaultValues.after,
    updated_at: defaultValues.updated_at
  };

  // Step 1: Check the current actuator status before updating
  const checkStatusQuery = `SELECT actuator_status, actuator_name FROM ${user_id}_actuator_table WHERE actuator_id = ?`;

  db.query(checkStatusQuery, [actuator_id], (err, result) => {
    if (err) {
      console.error('Error fetching current actuator status:', err);
      return res.status(500).json({ error: 'Database error while checking actuator status' });
    }

    const currentStatus = result.length > 0 ? result[0].actuator_status : null;
    const actuatorName = result.length > 0 ? result[0].actuator_name : 'Unknown'; // Default name if not found
    console.log(`Current actuator status: ${currentStatus}, New status: ${newData.actuator_status}, Actuator Name: ${actuatorName}`);
    // Step 2: Update the actuator table
    const updateActuatorTableQuery = `
      INSERT INTO ${user_id}_actuator_table
      (actuator_id, min_actuator_value, max_actuator_value, actuator_status, time, after, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        min_actuator_value = VALUES(min_actuator_value),
        max_actuator_value = VALUES(max_actuator_value),
        actuator_status = VALUES(actuator_status),
        time = VALUES(time),
        after = VALUES(after),
        updated_at = VALUES(updated_at)
    `;

    db.query(
      updateActuatorTableQuery,
      [actuator_id, newData.min_actuator_value, newData.max_actuator_value, newData.actuator_status, newData.time, newData.after, newData.updated_at],
      (err, result) => {
        if (err) {
          console.error('Error updating the actuator table:', err);
          return res.status(500).json({ error: 'Error updating the actuator table' });
        }

        console.log('Actuator table updated successfully.');

        // Step 3: If transitioning from "active" or "scheduled" to "inactive", set "cancelled" in actuator_data
        if (currentStatus && (currentStatus === 'active' || currentStatus === 'scheduled') && newData.actuator_status === 'inactive') {
          console.log(`Status changed from ${currentStatus} to inactive. Inserting into actuator_data with status 'cancelled'.`);

          const insertActuatorDataQuery = `
            INSERT INTO 10000001_actuator_data
            (actuator_id, actuator_status, timestamp, after, max_actuator_value, min_actuator_value, actuator_name, time)
            VALUES (?, 'cancelled', ?, ?, ?, ?, ?, ?)
          `;

          db.query(insertActuatorDataQuery, [actuator_id, newData.updated_at, newData.after, newData.max_actuator_value, newData.min_actuator_value, actuatorName, newData.time], (err, result) => {
            if (err) {
              console.error('Error inserting into actuator_data:', err);
              return res.status(500).json({ error: 'Error inserting into actuator_data' });
            }

            console.log('Actuator_data entry added successfully with status "cancelled".');
            res.status(201).json({ message: 'Actuator data inserted with status cancelled' });
          });

        } else {
          console.log(`Updating actuator_data with status: ${newData.actuator_status}`);

          const updateActuatorDataQuery = `
            INSERT INTO 10000001_actuator_data
            (actuator_id, actuator_status, timestamp, after, max_actuator_value, min_actuator_value, actuator_name, time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;

          db.query(updateActuatorDataQuery, [actuator_id, newData.actuator_status, newData.updated_at, newData.after, newData.max_actuator_value, newData.min_actuator_value, actuatorName, newData.time], (err, result) => {
            if (err) {
              console.error('Error updating actuator_data:', err);
              return res.status(500).json({ error: 'Error updating actuator_data' });
            }

            console.log('Actuator_data updated successfully.');
            res.status(201).json({ message: 'Actuator data updated successfully' });
          });
        }

      }
    );
  });
});

// Endpoint to get history of pumps in irrigation module
app.get('/current-actuator-data', (req, res) => {
  const { user_id } = req.query;

  // Validate input
  if (!user_id) {
    return res.status(400).send('User ID is required');
  }

  console.log(`SSE connection established for user_id: ${user_id} - Monitoring actuator data`);

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let lastSentData = null;

  const sendActuatorData = () => {
    const query = `SELECT actuator_data_id, actuator_id, actuator_status, timestamp, after, max_actuator_value, min_actuator_value, actuator_name, time FROM ${user_id}_actuator_data ORDER BY timestamp DESC LIMIT 100;`;

    db.query(query, (err, results) => {
      if (err) {
        console.error('Error querying the database:', err);
        res.write(`data: {"error": "Error querying the database"}\n\n`);
        return;
      }

      if (results.length > 0) {
        const dataToSend = results.map((pump) => ({
          actuator_data_id: pump.actuator_data_id,
          actuator_id: pump.actuator_id,
          actuator_status: pump.actuator_status,
          timestamp: pump.timestamp,
          after: pump.after,
          max_actuator_value: pump.max_actuator_value,
          min_actuator_value: pump.min_actuator_value,
          actuator_name: pump.actuator_name,
          time: pump.time,
        }));

        // Only send data if it's different from the last sent data
        if (JSON.stringify(dataToSend) !== JSON.stringify(lastSentData)) {
          res.write(`data: ${JSON.stringify(dataToSend)}\n\n`);
          lastSentData = dataToSend;
        }
      } else {
        if (lastSentData !== null) {
          res.write(`data: {"message": "No active actuator data found"}\n\n`);
          lastSentData = null;
        }
      }
    });
  };

  // Send initial actuator data
  sendActuatorData();

  // Check for updates every 10 seconds
  const interval = setInterval(sendActuatorData, 1000);

  // Cleanup when connection closes
  req.on('close', () => {
    console.log(`SSE connection closed for user_id: ${user_id}`);
    clearInterval(interval);
  });
});









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
