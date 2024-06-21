const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, date_time TEXT NOT NULL, image_url TEXT NOT NULL, ml_result TEXT)");
});

module.exports = db;
