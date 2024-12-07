const mysql = require("mysql2");
require("dotenv").config();

// MySQL connection configuration
const connection = mysql.createConnection({
  host: process.env.DB_HOST, // Database host
  user: process.env.DB_USER, // Database username
  password: process.env.DB_PASSWORD, // Database password
  database: process.env.DB_NAME, // Database name
});

// Function to generate random sensor values within the specified range
const generateRandomValue = (min, max) => {
  return Math.random() * (max - min) + min;
};

// Function to get a random sensor from the table
const getRandomSensor = (sensorId) => {
  const sensors = [
    {
      sensor_id: 50000001,
      pi_id: 70000001,
      esp_id: 60000001,
      sensor_type: "Temperature",
      min_value: -20,
      max_value: 50,
    },
    {
      sensor_id: 50000002,
      pi_id: 70000002,
      esp_id: 60000002,
      sensor_type: "Humidity",
      min_value: 0,
      max_value: 100,
    },
    {
      sensor_id: 50000003,
      pi_id: 70000001,
      esp_id: 60000001,
      sensor_type: "Air Pressure",
      min_value: 900,
      max_value: 1100,
    },
    {
      sensor_id: 50000004,
      pi_id: 70000001,
      esp_id: 60000001,
      sensor_type: "CO2 Level",
      min_value: 300,
      max_value: 2000,
    },
    {
      sensor_id: 50000005,
      pi_id: 70000001,
      esp_id: 60000001,
      sensor_type: "Soil Moisture",
      min_value: 0,
      max_value: 100,
    },
    {
      sensor_id: 50000006,
      pi_id: 70000002,
      esp_id: 60000002,
      sensor_type: "Light Intensity",
      min_value: 0,
      max_value: 100000,
    },
    {
      sensor_id: 50000007,
      pi_id: 70000002,
      esp_id: 60000002,
      sensor_type: "Wind Speed",
      min_value: 0,
      max_value: 60,
    },
    {
      sensor_id: 50000008,
      pi_id: 70000002,
      esp_id: 60000002,
      sensor_type: "Rainfall",
      min_value: 0,
      max_value: 500,
    },
    {
      sensor_id: 50000009,
      pi_id: 70000001,
      esp_id: 60000001,
      sensor_type: "Soil pH",
      min_value: 0,
      max_value: 14,
    },
    {
      sensor_id: 50000010,
      pi_id: 70000001,
      esp_id: 60000001,
      sensor_type: "Air Temperature",
      min_value: -50,
      max_value: 50,
    },
  ];

  return sensors.find((sensor) => sensor.sensor_id === sensorId);
};

// Function to insert data into the database
const insertSensorData = (sensor) => {
  const sensor_value = generateRandomValue(sensor.min_value, sensor.max_value);
  const timestamp = new Date().toISOString().slice(0, 19).replace("T", " "); // current timestamp

  const query = `INSERT INTO 10000001_sensors_data (sensor_id, esp_id, pi_id, timestamp, sensor_value, sensor_unit, sensor_status) VALUES (?, ?, ?, ?, ?, ?, ?)`;

  // Use 'normal' as default sensor status, and get the sensor unit from the sensor type
  const sensor_unit =
    sensor.sensor_type === "Humidity" || sensor.sensor_type === "Soil Moisture"
      ? "%"
      : sensor.sensor_type === "CO2 Level"
      ? "ppm"
      : "Celsius";
  const sensor_status = "normal"; // You can modify this to reflect actual sensor status (e.g., 'normal', 'error', etc.)

  connection.query(
    query,
    [
      sensor.sensor_id,
      sensor.esp_id,
      sensor.pi_id,
      timestamp,
      sensor_value,
      sensor_unit,
      sensor_status,
    ],
    (err, results) => {
      if (err) {
        console.error("Error inserting data:", err);
      } else {
        console.log("Data inserted:", results);
      }
    }
  );
};

// Function to simulate random data generation at random intervals for every sensor
const startRandomDataGeneration = () => {
  const sensors = [
    { sensor_id: 50000001 },
    { sensor_id: 50000002 },
    { sensor_id: 50000003 },
    { sensor_id: 50000004 },
    { sensor_id: 50000005 },
    { sensor_id: 50000006 },
    { sensor_id: 50000007 },
    { sensor_id: 50000008 },
    { sensor_id: 50000009 },
    { sensor_id: 50000010 },
  ];

  // Iterate through each sensor and create random data generation at different intervals
  sensors.forEach((sensor) => {
    setInterval(() => {
      const randomSensor = getRandomSensor(sensor.sensor_id); // Ensure we fetch the correct sensor with its min and max values
      insertSensorData(randomSensor);
    }, Math.random() * (60000 - 30000) + 7000); // Random interval between 7 to 15 seconds for each sensor
  });
};

// Start generating random data
startRandomDataGeneration();
