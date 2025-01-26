const pool = require('../database');

//kaaj kore
const createUser = async (req, res) => {
  const { name, email, password } = req.body;
  const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
  try {
    await pool.query(sql, [name, email, password]);
    res.send('User added successfully.');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

//kaaj kore
const getAllUsers = async (req, res) => {
  const sql = `SELECT * FROM users`;
  // console.log("run kore");
  try {
    const results = await pool.query(sql);
    res.json(results);
  } catch (err) {
    // console.log('run korse3');
    res.status(500).send(err.message);
  }
};

//kaaj korse
const getUserById = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const sql = `SELECT * FROM users WHERE user_id = ?`;
  try {
    const [result] = await pool.query(sql, [id]);
    res.json(result);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const updateUserById = async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  const sql = `UPDATE users SET name = ?, email = ? WHERE user_id = ?`;
  try {
    await pool.query(sql, [name, email, id]);
    res.send('User updated successfully.');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const deleteUserById = async (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM users WHERE user_id = ?';
  try {
    await pool.query(sql, [id]);
    res.send('User deleted successfully.');
  } catch (err) {
    res.status(500).send(err.message);
  }
};


module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById
};
