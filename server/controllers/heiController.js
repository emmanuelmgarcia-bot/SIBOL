const pool = require('../config/db');

const getAllHeis = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, campus, region FROM public.heis ORDER BY name ASC`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllHeis };