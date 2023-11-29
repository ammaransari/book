const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

const pool = new Pool({
  user: 'postgres', // local postgres username
  host: 'localhost', // host
  database: 'postgres', // local database name
  password: 'admin', // postgres password
  port: 5432, //port
});

app.use(bodyParser.json());

// Routes
app.get('/api/books', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM books');
  res.json(rows);
});

app.get('/api/books/:id', async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
  if (rows.length === 0) {
    res.status(404).json({ message: 'Book not found' });
  } else {
    res.json(rows[0]);
  }
});

app.post('/api/books', async (req, res) => {
  const { title, author, genre } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO books (title, author, genre) VALUES ($1, $2, $3) RETURNING *',
    [title, author, genre]
  );
  res.status(201).json(rows[0]);
});

app.put('/api/books/:id', async (req, res) => {
  const { id } = req.params;
  const { title, author, genre } = req.body;
  const { rows } = await pool.query(
    'UPDATE books SET title = $1, author = $2, genre = $3 WHERE id = $4 RETURNING *',
    [title, author, genre, id]
  );
  if (rows.length === 0) {
    res.status(404).json({ message: 'Book not found' });
  } else {
    res.json(rows[0]);
  }
});

app.delete('/api/books/:id', async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('DELETE FROM books WHERE id = $1 RETURNING *', [id]);
  if (rows.length === 0) {
    res.status(404).json({ message: 'Book not found' });
  } else {
    res.json({ message: 'Book deleted successfully' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
