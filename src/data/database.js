const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./src/data/gps-users.db', (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         name TEXT NOT NULL,
         email TEXT NOT NULL UNIQUE,
         latitude REAL NOT NULL,
         longitude REAL NOT NULL
       )`,
      (err) => {
        if (err) {
          console.error("Error creating table:", err.message);
        } else {
          console.log("Users table is ready.");
        }
      }
    );
  }
});

module.exports = db;
