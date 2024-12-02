const mysql = require("mysql2");
const bcrypt = require("bcrypt");

// MySQL connection setup
const db = mysql.createConnection({
  host: process.env.DB_HOST, // Database host
  user: process.env.DB_USER, // Database username
  password: process.env.DB_PASSWORD, // Database password
  database: process.env.DB_NAME, // Database name
});

// Connect to the database
db.connect(async (err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database");

  try {
    // Fetch all users with plain-text passwords
    const [rows] = await db
      .promise()
      .query("SELECT user_id, password FROM users_data");

    for (const user of rows) {
      const hashedPassword = await bcrypt.hash(user.password, 10); // Hash the password

      // Update the password in the database
      await db
        .promise()
        .query("UPDATE users_data SET password = ? WHERE user_id = ?", [
          hashedPassword,
          user.user_id,
        ]);

      console.log(`Password updated for user_id: ${user.user_id}`);
    }

    console.log("All passwords have been hashed successfully");
    db.end();
  } catch (error) {
    console.error("Error updating passwords:", error);
    db.end();
  }
});
