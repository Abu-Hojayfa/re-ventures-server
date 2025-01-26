const pool = require('../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Secret key for JWT
const secretKey = 'your_secret_key';

// Check if the user already exists
const userExists = async (email) => {
  try {
    const sql = `SELECT user_id FROM users WHERE email = ?`;
    const [exists] = await pool.query(sql, [email]);
    return exists.length > 0;
  } catch (error) {
    throw new Error(error.message);
  }
};

const signUp = async (req, res) => {
  try {
    const { email, name, password} = req.body;

    // Check if the user already exists
    const exists = await userExists(email);
    if (exists) {
      return res.status(400).send('User already exists.');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const sql = `INSERT INTO users (email, name, password ) VALUES (?, ?, ?)`;
    await pool.query(sql, [email, name, hashedPassword]);

    res.status(200).send('User added successfully.');
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

const signIn = async (req, res) => {
  const { email, password } = req.body;
  const sql = `SELECT * FROM users WHERE email = ?`;
  
  try {
    // Find the user by email
    const [result] = await pool.query(sql, [email]);
    if (result.length === 0) {
      return res.status(400).send('Invalid email.');
    }

    const user = result[0];

    // Compare the password with the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).send('Invalid password.');
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user.user_id }, secretKey, { expiresIn: '1d' });

    // Send the token in the response
    return res.status(200).send(user);
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

module.exports = {
  signUp,
  signIn,
};
