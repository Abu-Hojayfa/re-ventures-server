const pool = require('../database');

// Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const sql = `SELECT * FROM reviews`;
    const [reviews] = await pool.query(sql);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single review by ID
exports.getReviewById = async (req, res) => {
  const { id } = req.params;
  try {
    const sql = `SELECT * FROM reviews WHERE review_id = ?`;
    const [review] = await pool.query(sql, [id]);

    if (review.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json(review[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new review
exports.createReview = async (req, res) => {
  const { rating, comment, user_id, house_id } = req.body;

  try {
    // Check if a review already exists for this user and house
    const checkSql = `SELECT * FROM reviews WHERE user_id = ? AND house_id = ?`;
    const [existingReview] = await pool.query(checkSql, [user_id, house_id]);

    if (existingReview.length > 0) {
      return res.status(400).json({ message: 'A review from this user for this house already exists.' });
    }

    // Insert the new review
    const sql = `
      INSERT INTO reviews (rating, comment, user_id, house_id)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.query(sql, [rating, comment, user_id, house_id]);

    res.status(201).json({ review_id: result.insertId, rating, comment, user_id, house_id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  try {
    // Check if the review exists
    const findSql = `SELECT * FROM reviews WHERE review_id = ?`;
    const [review] = await pool.query(findSql, [id]);

    if (review.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Update the review
    const updateSql = `
      UPDATE reviews
      SET rating = ?, comment = ?
      WHERE review_id = ?
    `;
    await pool.query(updateSql, [rating || review[0].rating, comment || review[0].comment, id]);

    res.status(200).json({ review_id: id, rating: rating || review[0].rating, comment: comment || review[0].comment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the review exists
    const findSql = `SELECT * FROM reviews WHERE review_id = ?`;
    const [review] = await pool.query(findSql, [id]);

    if (review.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Delete the review
    const deleteSql = `DELETE FROM reviews WHERE review_id = ?`;
    await pool.query(deleteSql, [id]);

    res.status(200).json({ message: 'Review deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Find all reviews for a specific house
exports.getReviewsByHouseId = async (req, res) => {
  const { house_id } = req.params;

  try {
    const sql = `SELECT * FROM reviews WHERE house_id = ?`;
    const [reviews] = await pool.query(sql, [house_id]);

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
