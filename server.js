const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize database
const db = new sqlite3.Database('./secret_santa.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    
    // Create tables
    db.run(`CREATE TABLE IF NOT EXISTS names (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )`, (err) => {
      if (err) {
        console.error('Error creating names table:', err.message);
      } else {
        // Insert names if table is empty
        db.get('SELECT COUNT(*) as count FROM names', (err, row) => {
          if (err) {
            console.error('Error checking names:', err.message);
          } else if (row.count === 0) {
            const names = [
              'Erblina', 'A. Halilaj', 'A.Zebergja', 'Adonis', 'Endrit',
              'Erijon', 'Ermir', 'Kastriot', 'Miran', 'Ndriqim',
              'Rigon', 'Rita', 'Sheraida', 'Yllka'
            ];
            const stmt = db.prepare('INSERT INTO names (name) VALUES (?)');
            names.forEach(name => {
              stmt.run(name);
            });
            stmt.finalize();
            console.log('Initialized names in database');
          }
        });
      }
    });

    db.run(`CREATE TABLE IF NOT EXISTS selections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_id INTEGER NOT NULL,
      selected_by TEXT NOT NULL,
      selected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (name_id) REFERENCES names (id),
      UNIQUE(name_id)
    )`, (err) => {
      if (err) {
        console.error('Error creating selections table:', err.message);
      }
    });
  }
});

// Get all names with selection status
app.get('/api/names', (req, res) => {
  db.all(`
    SELECT 
      n.id,
      n.name,
      COUNT(s.id) as selection_count,
      GROUP_CONCAT(s.selected_by) as selected_by_names
    FROM names n
    LEFT JOIN selections s ON n.id = s.name_id
    GROUP BY n.id, n.name
    ORDER BY n.name
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(row => ({
      id: row.id,
      name: row.name,
      selectionCount: row.selection_count,
      isSelected: row.selection_count > 0,
      selectedBy: row.selected_by_names ? row.selected_by_names.split(',') : []
    })));
  });
});

// Select a name
app.post('/api/select', (req, res) => {
  const { nameId } = req.body;

  if (!nameId) {
    res.status(400).json({ error: 'Name ID is required' });
    return;
  }

  // Check if name is already selected
  db.get('SELECT * FROM selections WHERE name_id = ?', [nameId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (row) {
      res.status(400).json({ error: 'This name has already been selected' });
      return;
    }

    // Insert selection (anonymous)
    db.run(
      'INSERT INTO selections (name_id, selected_by) VALUES (?, ?)',
      [nameId, 'Anonymous'],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ success: true, message: 'Name selected successfully' });
      }
    );
  });
});

// Get selection statistics
app.get('/api/stats', (req, res) => {
  db.get(`
    SELECT 
      COUNT(DISTINCT n.id) as total_names,
      COUNT(s.id) as selected_count
    FROM names n
    LEFT JOIN selections s ON n.id = s.name_id
  `, (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      total: row.total_names,
      selected: row.selected_count,
      remaining: row.total_names - row.selected_count
    });
  });
});

// Reset all selections (optional admin endpoint)
app.post('/api/reset', (req, res) => {
  db.run('DELETE FROM selections', (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true, message: 'All selections reset' });
  });
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

