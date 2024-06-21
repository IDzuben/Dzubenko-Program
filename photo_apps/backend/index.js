const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const { classifyEmotion } = require('./emotion_classifier');

const app = express();
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'frontend')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/posts', (req, res) => {
    db.all("SELECT * FROM posts", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.post('/posts', upload.single('image'), async (req, res) => {
    const { date_time } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;
    const mlResult = await classifyEmotion(path.join(__dirname, imageUrl)); // Виклик функції розпізнавання емоцій

    db.run(`INSERT INTO posts (date_time, image_url, ml_result) VALUES (?, ?, ?)`, [date_time, imageUrl, JSON.stringify(mlResult)], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

app.put('/posts/:id', (req, res) => {
    const { newName } = req.body;
    db.get(`SELECT image_url FROM posts WHERE id = ?`, req.params.id, (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            const oldPath = path.join(__dirname, row.image_url);
            const newPath = path.join(__dirname, 'uploads', newName);
            fs.rename(oldPath, newPath, (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                const newImageUrl = `/uploads/${newName}`;
                db.run(`UPDATE posts SET image_url = ? WHERE id = ?`, [newImageUrl, req.params.id], function(err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json({ updatedID: req.params.id });
                });
            });
        } else {
            res.status(404).json({ error: 'Post not found' });
        }
    });
});

app.delete('/posts/:id', (req, res) => {
    db.get(`SELECT image_url FROM posts WHERE id = ?`, req.params.id, (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            const imagePath = path.join(__dirname, row.image_url);
            fs.unlink(imagePath, (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                db.run(`DELETE FROM posts WHERE id = ?`, req.params.id, function(err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json({ deletedID: req.params.id });
                });
            });
        } else {
            res.status(404).json({ error: 'Post not found' });
        }
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
