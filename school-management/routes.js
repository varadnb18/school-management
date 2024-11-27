import express from "express";
import pool from "./db.js";
const router = express.Router();

router.get("/listSchools", async (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res
      .status(400)
      .json({ error: "Latitude and longitude are required" });
  }

  try {
    const sql = `SELECT * FROM schools`;

    const [schools] = await pool.query(sql);

    const toRadians = (degrees) => degrees * (Math.PI / 180);
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = toRadians(lat2 - lat1);
      const dLon = toRadians(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) *
          Math.cos(toRadians(lat2)) *
          Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const sortedSchools = schools
      .map((school) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          school.latitude,
          school.longitude
        );
        return { ...school, distance };
      })
      .sort((a, b) => a.distance - b.distance);

    res.json(sortedSchools);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/addSchool", async (req, res) => {
  const { name, address, latitude, longitude } = req.body;
  if (!name || !address || !latitude || !longitude) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const sql = `INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)`;
  const values = [name, address, latitude, longitude];
  try {
    await pool.query(sql, values, (err, result) => {
      if (err) {
        console.log("Unable to SignUp", err);
        return res.status(500).send("Server error");
      }
    });

    console.log("Data inserted successfully", {
      name,
      address,
      latitude,
      longitude,
    });

    res.status(200).send("School added successfully");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
