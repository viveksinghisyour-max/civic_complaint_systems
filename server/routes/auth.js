const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = "my_super_secret_key_for_prototype"; // In production, use env var

// Register
router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const userRole = role === 'admin' ? 'admin' : 'citizen';

    const sql = 'INSERT INTO users (username, password, role) VALUES (?,?,?)';
    const params = [username, hash, userRole];

    db.run(sql, params, function (err) {
        if (err) {
            if (err.message.includes("UNIQUE constraint failed")) {
                return res.status(400).json({ error: "Username already exists" });
            }
            return res.status(400).json({ error: err.message });
        }
        res.json({
            message: "User registered successfully",
            data: { id: this.lastID, username, role: userRole }
        });
    });
});

// Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = "select * from users where username = ?";

    db.get(sql, [username], async (err, row) => {
        if (err) {
            return res.status(400).json({ "error": err.message });
        }
        if (!row) {
            return res.status(401).json({ "error": "Invalid username or password" });
        }

        const validPassword = await bcrypt.compare(password, row.password);
        if (!validPassword) {
            return res.status(401).json({ "error": "Invalid username or password" });
        }

        // Create token
        const token = jwt.sign(
            { id: row.id, username: row.username, role: row.role },
            SECRET_KEY,
            { expiresIn: '24h' }
        );

        res.json({
            message: "Login success",
            token,
            user: { id: row.id, username: row.username, role: row.role }
        });
    });
});

module.exports = router;
