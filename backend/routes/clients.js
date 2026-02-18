const express = require('express');
const router = express.Router();
const { all, get, run } = require('../database');

// GET /api/clients — list all
router.get('/', (req, res) => {
  const clients = all('SELECT * FROM clients ORDER BY name');
  res.json(clients);
});

// GET /api/clients/:id
router.get('/:id', (req, res) => {
  const client = get('SELECT * FROM clients WHERE id = ?', [Number(req.params.id)]);
  if (!client) return res.status(404).json({ error: 'Client not found' });
  res.json(client);
});

// POST /api/clients
router.post('/', (req, res) => {
  const { name, email, phone, address } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const result = run(
    'INSERT INTO clients (name, email, phone, address) VALUES (?, ?, ?, ?)',
    [name, email || null, phone || null, address || null]
  );

  const client = get('SELECT * FROM clients WHERE id = ?', [result.lastInsertRowid]);
  res.status(201).json(client);
});

// PUT /api/clients/:id
router.put('/:id', (req, res) => {
  const { name, email, phone, address } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const existing = get('SELECT * FROM clients WHERE id = ?', [Number(req.params.id)]);
  if (!existing) return res.status(404).json({ error: 'Client not found' });

  run(
    'UPDATE clients SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
    [name, email || null, phone || null, address || null, Number(req.params.id)]
  );

  const client = get('SELECT * FROM clients WHERE id = ?', [Number(req.params.id)]);
  res.json(client);
});

// DELETE /api/clients/:id
router.delete('/:id', (req, res) => {
  const existing = get('SELECT * FROM clients WHERE id = ?', [Number(req.params.id)]);
  if (!existing) return res.status(404).json({ error: 'Client not found' });

  run('DELETE FROM clients WHERE id = ?', [Number(req.params.id)]);
  res.json({ message: 'Client deleted' });
});

module.exports = router;
