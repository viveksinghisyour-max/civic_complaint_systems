const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const DBSOURCE = "database.sqlite";

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    } else {
        console.log('Connected to the SQLite database.');

        // Create Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username text UNIQUE, 
            password text, 
            role text,
            CONSTRAINT username_unique UNIQUE (username)
            )`,
            async (err) => {
                if (err) {
                    // Table already created
                } else {
                    // Create default admin user if tables are newly created
                    const salt = await bcrypt.genSalt(10);
                    const hash = await bcrypt.hash('admin123', salt);
                    const insert = 'INSERT INTO users (username, password, role) VALUES (?,?,?)';
                    db.run(insert, ["admin", hash, "admin"], (err) => {
                        if (!err) console.log("Default admin user created: admin / admin123");
                    });
                }
            });

        // Create Complaints Table
        db.run(`CREATE TABLE IF NOT EXISTS complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            description text, 
            image_base64 text,
            latitude real,
            longitude real,
            category text,
            department text,
            status text,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            resolved_image_base64 text,
            resolved_at DATETIME,
            user_id INTEGER,
            FOREIGN KEY(user_id) REFERENCES users(id)
            )`,
            (err) => {
                if (err) {
                    // Table already created
                }
            });
    }
});

module.exports = db;
