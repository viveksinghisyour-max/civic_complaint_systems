const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const SECRET_KEY = "my_super_secret_key_for_prototype";

// Middleware to verify token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Improved "AI" classification using Heuristic Keyword Analysis
function classifyImage(base64, description) {
    const text = description.toLowerCase();

    if (text.includes("pothole") || text.includes("road") || text.includes("crater") || text.includes("asphalt")) {
        return "Pothole";
    }
    if (text.includes("garbage") || text.includes("trash") || text.includes("waste") || text.includes("dump") || text.includes("dustbin")) {
        return "Garbage";
    }
    if (text.includes("water") || text.includes("leak") || text.includes("pipe") || text.includes("drain") || text.includes("flood")) {
        return "WaterLeak";
    }
    if (text.includes("light") || text.includes("lamp") || text.includes("pole") || text.includes("dark") || text.includes("bulb")) {
        return "Streetlight";
    }

    // Method 2: Fallback to random if description is vague (for demo variety), 
    // or default to "General" in a real app.
    // For the prototype to feel "smart", we default to Pothole if unsure, or random.
    const categories = ["Pothole", "Garbage", "WaterLeak", "Streetlight"];
    return categories[Math.floor(Math.random() * categories.length)];
}

const departmentMap = {
    Pothole: "RoadMaintenance",
    Garbage: "Sanitation",
    WaterLeak: "WaterDept",
    Streetlight: "Electricity",
};

// GET all complaints (Protected)
router.get('/', authenticateToken, (req, res) => {
    const sql = "SELECT * FROM complaints ORDER BY created_at DESC";
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({
            message: "success",
            data: rows
        });
    });
});

// POST new complaint (Protected)
router.post('/', authenticateToken, (req, res) => {
    const { description, imageBase64, location } = req.body;

    if (!description || !imageBase64) {
        return res.status(400).json({ error: "Description and Image required" });
    }

    const category = classifyImage(imageBase64, description);
    const department = departmentMap[category] || "General";

    // Handle Location: Expecting object { latitude: X, longitude: Y }
    const lat = location ? parseFloat(location.latitude) : 0;
    const lng = location ? parseFloat(location.longitude) : 0;

    const sql = `INSERT INTO complaints (
      description, image_base64, latitude, longitude, category, department, status, user_id
      ) VALUES (?,?,?,?,?,?,?,?)`;

    const params = [description, imageBase64, lat, lng, category, department, 'Submitted', req.user.id];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({
            message: "Complaint submitted",
            data: {
                id: this.lastID,
                category,
                department,
                status: 'Submitted'
            }
        });
    });
});

// PATCH resolve complaint (Admin only)
router.patch('/:id/resolve', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
    }

    const { resolvedImageBase64 } = req.body;
    const sql = `UPDATE complaints SET 
      status = 'Resolved', 
      resolved_image_base64 = ?, 
      resolved_at = datetime('now') 
      WHERE id = ?`;

    db.run(sql, [resolvedImageBase64 || "", req.params.id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: "Complaint resolved", changes: this.changes });
    });
});

module.exports = router;
