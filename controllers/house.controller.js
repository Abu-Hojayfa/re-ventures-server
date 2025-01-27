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

const getPropertyDetails = async (req, res) => {
  try {
    // Query each table separately for all properties
    const houseQuery = `SELECT * FROM houses`;
    const houseDetailsQuery = `SELECT * FROM house_details`;
    const pricesQuery = `SELECT * FROM prices`;
    const imagesQuery = `SELECT * FROM images`;
    const usersQuery = `SELECT * FROM users`; // Query for user info (owner)

    // Execute all the queries in parallel
    const [houseResults] = await pool.query(houseQuery);
    const [houseDetailsResults] = await pool.query(houseDetailsQuery);
    const [pricesResults] = await pool.query(pricesQuery);
    const [imageResults] = await pool.query(imagesQuery);
    const [userResults] = await pool.query(usersQuery); // Fetch users

    // Check if any results are found
    if (houseResults.length === 0) {
      return res.status(404).json({ message: 'No properties found.' });
    }

    // Construct the response JSON combining all tables data
    const response = houseResults.map((house) => {
      const houseDetails = houseDetailsResults.find((detail) => detail.house_id === house.house_id) || null;
      const price = pricesResults.find((price) => price.house_id === house.house_id) || null;
      const image = imageResults.find((image) => image.house_id === house.house_id) || null; // Only one image
      const user = userResults.find((user) => user.user_id === house.user_id) || null; // Get user info (owner)

      return {
        house,
        house_details: houseDetails,
        prices: price,
        image, // Only one image (first found)
        user,  // User (property owner)
      };
    });

    res.status(200).json(response); // Send the combined response for all houses
  } catch (error) {
    console.error('Error fetching property details:', error.message);
    res.status(500).json({ message: 'Failed to fetch property details.' });
  }
};

const getPropertyDetailsByType = async (req, res) => {
  const { type } = req.params; // Type is extracted as a string

  try {
    // First, get the house details based on type
    const houseDetailsQuery = `SELECT * FROM house_details WHERE type = ?`;
    const [houseDetailsResults] = await pool.query(houseDetailsQuery, [type]);

    if (houseDetailsResults.length === 0) {
      return res.status(404).json({ message: `No properties found for type "${type}".` });
    }

    // Extract house_ids from house_details
    const houseIds = houseDetailsResults.map((detail) => detail.house_id);

    // Query for houses
    const houseQuery = `SELECT * FROM houses WHERE house_id IN (?)`;
    const [houseResults] = await pool.query(houseQuery, [houseIds]);

    // Query for prices
    const pricesQuery = `SELECT * FROM prices WHERE house_id IN (?)`;
    const [pricesResults] = await pool.query(pricesQuery, [houseIds]);

    // Query for images
    const imagesQuery = `SELECT * FROM images WHERE house_id IN (?)`;
    const [imagesResults] = await pool.query(imagesQuery, [houseIds]);

    // Query for users (who owns these houses)
    const userQuery = `SELECT * FROM users WHERE user_id IN (SELECT DISTINCT user_id FROM houses WHERE house_id IN (?))`;
    const [userResults] = await pool.query(userQuery, [houseIds]);

    // Construct the JSON response
    const response = houseDetailsResults.map((houseDetail) => {
      const house = houseResults.find((h) => h.house_id === houseDetail.house_id);
      const price = pricesResults.find((p) => p.house_id === houseDetail.house_id);
      const image = imagesResults.find((i) => i.house_id === houseDetail.house_id);
      const user = userResults.find((u) => u.user_id === house.user_id);

      return {
        house: house || null,
        house_details: houseDetail || null,
        prices: price || null,
        images: image || null,
        user: user || null,
      };
    });

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
  getPropertyDetailsById,
  getPropertyDetailsByType
};
