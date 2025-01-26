const mysql = require('mysql2');

// Create the connection pool
const pool = mysql.createPool({
  host: 'localhost', // Your machine's address, 'localhost' for local development
  user: 'root',   // Your MySQL username
  password: '1234', // Your MySQL password
  database: 'xyz', // Your MySQL database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise(); // Export a promise-based interface