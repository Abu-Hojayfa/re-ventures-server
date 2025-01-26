const pool = require('../database.js');

// Controller to add a house and related data
const createHouse = async (req, res) => {
  const {
    title,
    description,
    full_address,
    country,
    state,
    zip,
    user_id,
    type,
    status,
    property_area,
    bedrooms,
    bathrooms,
    rooms,
    year_build,
    neighborhood,
    latitude,
    longitude,
    label,
    land_area,
    garage_size,
    air_condition,
    cable_tv,
    elevator,
    wifi,
    pet_friendly,
    furnished,
    garden,
    swimming_pool,
    intercom,
    disabled_access,
    fireplace,
    garage,
    heating,
    security,
    parking,
    price,
    before_price_label,
    after_price_label,
  } = req.body;

  try {
    // Insert into houses
    const houseQuery = `
      INSERT INTO houses (title, description, full_address, country, state, zip, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [houseResult] = await pool.query(houseQuery, [
      title,
      description,
      full_address,
      country,
      state,
      zip,
      user_id,
    ]);

    const house_id = houseResult.insertId;

    // Insert into house_details
    const detailsQuery = `
      INSERT INTO house_details (
        type, status, property_area, bedrooms, bathrooms, rooms, year_build, 
        neighborhood, latitude, longitude, label, land_area, garage_size, house_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await pool.query(detailsQuery, [
      type,
      status,
      property_area,
      bedrooms,
      bathrooms,
      rooms,
      year_build,
      neighborhood,
      latitude,
      longitude,
      label,
      land_area,
      garage_size,
      house_id,
    ]);

    // Insert into amenities
    const amenitiesQuery = `
      INSERT INTO amenities (
        air_condition, cable_tv, elevator, wifi, pet_friendly, furnished, garden, 
        swimming_pool, intercom, disabled_access, fireplace, garage, heating, 
        security, parking, house_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await pool.query(amenitiesQuery, [
      air_condition ? 1 : 0,
      cable_tv ? 1 : 0,
      elevator ? 1 : 0,
      wifi ? 1 : 0,
      pet_friendly ? 1 : 0,
      furnished ? 1 : 0,
      garden ? 1 : 0,
      swimming_pool ? 1 : 0,
      intercom ? 1 : 0,
      disabled_access ? 1 : 0,
      fireplace ? 1 : 0,
      garage ? 1 : 0,
      heating ? 1 : 0,
      security ? 1 : 0,
      parking ? 1 : 0,
      house_id,
    ]);

    // Insert into prices
    const pricesQuery = `
      INSERT INTO prices (price, before_price_label, after_price_label, house_id)
      VALUES (?, ?, ?, ?)
    `;
    await pool.query(pricesQuery, [price, before_price_label, after_price_label, house_id]);

    res.status(201).send({ message: 'House and related data added successfully!' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: 'Failed to add house.' });
  }
};

// Find all houses properties er data
const findAllHouses = async (req, res) => {
  const sql = 'SELECT * FROM houses';
  try {
    const [results] = await pool.query(sql);
    res.send(results);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Some error occurred while retrieving houses.',
    });
  }
};

// Fetch house and all related details
const getPropertyDetails = async (req, res) => {
  const { house_id } = req.params;
  try {
    const sql = `
      SELECT 
        h.*,
        hd.type, hd.status, hd.property_area, hd.bedrooms, hd.bathrooms, hd.rooms, 
        hd.year_build, hd.neighborhood, hd.latitude, hd.longitude, hd.label, 
        hd.land_area, hd.garage_size,
        a.air_condition, a.cable_tv, a.elevator, a.wifi, a.pet_friendly, a.furnished, 
        a.garden, a.swimming_pool, a.intercom, a.disabled_access, a.fireplace, 
        a.garage, a.heating, a.security, a.parking,
        p.price, p.before_price_label, p.after_price_label
      FROM 
        houses h
      LEFT JOIN 
        house_details hd ON h.house_id = hd.house_id
      LEFT JOIN 
        amenities a ON h.house_id = a.house_id
      LEFT JOIN 
        prices p ON h.house_id = p.house_id
    `;
    const [results] = await pool.query(sql);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching house details:', error.message);
    res.status(500).json({ message: 'Failed to fetch house and related details.' });
  }
};

const getPropertyDetailsById = async (req, res) => {
  const { house_id } = req.params; // Extract house_id from request parameters

  try {
    // Query each table separately
    const houseQuery = `SELECT * FROM houses WHERE house_id = ?`;
    const houseDetailsQuery = `SELECT * FROM house_details WHERE house_id = ?`;
    const amenitiesQuery = `SELECT * FROM amenities WHERE house_id = ?`;
    const pricesQuery = `SELECT * FROM prices WHERE house_id = ?`;
    const imagesQuery = `SELECT * FROM images WHERE house_id = ?`; // No need for LIMIT since only one image row

    // Execute the queries
    const [houseResults] = await pool.query(houseQuery, [house_id]);
    const [houseDetailsResults] = await pool.query(houseDetailsQuery, [house_id]);
    const [amenitiesResults] = await pool.query(amenitiesQuery, [house_id]);
    const [pricesResults] = await pool.query(pricesQuery, [house_id]);
    const [imageResult] = await pool.query(imagesQuery, [house_id]); // Fetch one image row (one record per house)

    // Check if the house exists
    if (houseResults.length === 0) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    // Construct the JSON response
    const response = {
      house: houseResults[0] || null,
      house_details: houseDetailsResults[0] || null,
      amenities: amenitiesResults[0] || null,
      prices: pricesResults[0] || null,
      images: imageResult[0] || null, // Include only one image row (or null if not found)
    };

    res.status(200).json(response); // Send the combined response
  } catch (error) {
    console.error('Error fetching property details:', error.message);
    res.status(500).json({ message: 'Failed to fetch property details.' });
  }
};



// Find a single house by ID
const findHouseById = async (req, res) => {
  const { house_id } = req.params;
  const sql = `SELECT * FROM houses WHERE house_id = ?`;
  try {
    const [results] = await pool.query(sql, [house_id]);
    if (results.length === 0) {
      return res.status(404).send('House not found.');
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Update a house by ID
const updateHouseById = async (req, res) => {
  const { house_id } = req.params;
  const updates = req.body;
  const sql = 'UPDATE houses SET ? WHERE house_id = ?';
  try {
    await pool.query(sql, [updates, house_id]);
    res.send({ id: house_id, ...updates });
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Some error occurred while updating the house.',
    });
  }
};

// Delete a house by ID
const deleteHouse = async (req, res) => {
  const { house_id } = req.params;
  const sql = 'DELETE FROM houses WHERE house_id = ?';
  try {
    await pool.query(sql, [house_id]);
    res.send('House deleted successfully.');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Find all houses owned by a specific user
const findHousesByOwner = async (req, res) => {
  const { user_id } = req.params;
  const sql = 'SELECT * FROM houses WHERE user_id = ?';
  try {
    const [results] = await pool.query(sql, [user_id]);
    res.send(results);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Some error occurred while retrieving houses for the user.',
    });
  }
};

module.exports = {
  createHouse,
  findAllHouses,
  getPropertyDetails,
  findHouseById,
  updateHouseById,
  deleteHouse,
  findHousesByOwner,
  getPropertyDetailsById
};
