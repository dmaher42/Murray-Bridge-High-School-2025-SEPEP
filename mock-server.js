const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory data store
const db = { teams: [], fixtures: [], results: [] };

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// API routes
app.get('/api', (req, res) => {
  const { action } = req.query;
  if (action === 'readAll') {
    return res.json(db);
  }
  return res.status(400).json({ error: 'Unknown action' });
});

app.post('/api', (req, res) => {
  const { action } = req.body;
  switch (action) {
    case 'upsertTeam': {
      const team = req.body.team || {};
      if (!team.id) team.id = uid();
      const idx = db.teams.findIndex(t => t.id === team.id);
      if (idx >= 0) db.teams[idx] = team; else db.teams.push(team);
      return res.json({ team });
    }
    case 'upsertFixture': {
      const fixture = req.body.fixture || {};
      if (!fixture.id) fixture.id = uid();
      const idx = db.fixtures.findIndex(f => f.id === fixture.id);
      if (idx >= 0) db.fixtures[idx] = fixture; else db.fixtures.push(fixture);
      return res.json({ fixture });
    }
    case 'upsertResult': {
      const result = req.body.result || {};
      if (!result.id) result.id = uid();
      const idx = db.results.findIndex(r => r.id === result.id);
      if (idx >= 0) db.results[idx] = result; else db.results.push(result);
      return res.json({ result });
    }
    case 'deleteFixtureRemote': {
      const { id } = req.body;
      db.fixtures = db.fixtures.filter(f => f.id !== id);
      db.results = db.results.filter(r => r.id !== id);
      return res.json({ success: true });
    }
    default:
      return res.status(400).json({ error: 'Unknown action' });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
  console.log(`Mock server running at http://localhost:${PORT}`);
  console.log('Open http://localhost:' + PORT + '/?mock=1 to use it.');
});
