const express = require('express');
const router = express.Router();
const { all, get, run, getDb, saveDatabase } = require('../database');

// Generate next invoice number
function getNextInvoiceNumber() {
  const row = get('SELECT invoice_number FROM invoices ORDER BY id DESC LIMIT 1');
  if (!row) return 'INV-0001';
  const num = parseInt(row.invoice_number.replace('INV-', ''), 10);
  return `INV-${String(num + 1).padStart(4, '0')}`;
}

// GET /api/invoices — list all with client name
router.get('/', (req, res) => {
  const { status } = req.query;

  let sql = `
    SELECT i.*, c.name as client_name,
      (SELECT COALESCE(SUM(quantity * unit_price), 0) FROM invoice_items WHERE invoice_id = i.id) as subtotal
    FROM invoices i
    LEFT JOIN clients c ON i.client_id = c.id
  `;

  const params = [];
  if (status && ['draft', 'sent', 'paid'].includes(status)) {
    sql += ' WHERE i.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY i.created_at DESC';

  const invoices = all(sql, params);
  res.json(invoices.map(inv => ({
    ...inv,
    subtotal: inv.subtotal || 0,
    total: (inv.subtotal || 0) * (1 + (inv.tax_rate || 0) / 100)
  })));
});

// GET /api/invoices/:id — with items + client
router.get('/:id', (req, res) => {
  const invoice = get(`
    SELECT i.*, c.name as client_name, c.email as client_email,
           c.phone as client_phone, c.address as client_address
    FROM invoices i
    LEFT JOIN clients c ON i.client_id = c.id
    WHERE i.id = ?
  `, [Number(req.params.id)]);

  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

  const items = all('SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id', [Number(req.params.id)]);

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  res.json({
    ...invoice,
    items,
    subtotal,
    tax_amount: subtotal * (invoice.tax_rate || 0) / 100,
    total: subtotal * (1 + (invoice.tax_rate || 0) / 100)
  });
});

// POST /api/invoices — create with items
router.post('/', (req, res) => {
  const { client_id, date, due_date, status, tax_rate, notes, items } = req.body;

  if (!date || !due_date) {
    return res.status(400).json({ error: 'Date and due date are required' });
  }

  const invoice_number = getNextInvoiceNumber();
  const db = getDb();

  try {
    const result = run(
      `INSERT INTO invoices (invoice_number, client_id, date, due_date, status, tax_rate, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [invoice_number, client_id || null, date, due_date, status || 'draft', tax_rate || 0, notes || null]
    );

    const invoiceId = result.lastInsertRowid;

    if (items && items.length > 0) {
      for (const item of items) {
        run(
          'INSERT INTO invoice_items (invoice_id, description, quantity, unit_price) VALUES (?, ?, ?, ?)',
          [invoiceId, item.description, item.quantity || 1, item.unit_price || 0]
        );
      }
    }

    const invoice = get('SELECT * FROM invoices WHERE id = ?', [invoiceId]);
    const savedItems = all('SELECT * FROM invoice_items WHERE invoice_id = ?', [invoiceId]);

    res.status(201).json({ ...invoice, items: savedItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/invoices/:id — update with items
router.put('/:id', (req, res) => {
  const { client_id, date, due_date, status, tax_rate, notes, items } = req.body;
  const id = Number(req.params.id);

  const existing = get('SELECT * FROM invoices WHERE id = ?', [id]);
  if (!existing) return res.status(404).json({ error: 'Invoice not found' });

  try {
    run(
      `UPDATE invoices SET client_id = ?, date = ?, due_date = ?, status = ?, tax_rate = ?, notes = ?
       WHERE id = ?`,
      [
        client_id || null,
        date || existing.date,
        due_date || existing.due_date,
        status || existing.status,
        tax_rate != null ? tax_rate : existing.tax_rate,
        notes != null ? notes : existing.notes,
        id
      ]
    );

    // Replace all items
    run('DELETE FROM invoice_items WHERE invoice_id = ?', [id]);
    if (items && items.length > 0) {
      for (const item of items) {
        run(
          'INSERT INTO invoice_items (invoice_id, description, quantity, unit_price) VALUES (?, ?, ?, ?)',
          [id, item.description, item.quantity || 1, item.unit_price || 0]
        );
      }
    }

    const invoice = get('SELECT * FROM invoices WHERE id = ?', [id]);
    const savedItems = all('SELECT * FROM invoice_items WHERE invoice_id = ?', [id]);

    res.json({ ...invoice, items: savedItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/invoices/:id/status
router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  if (!status || !['draft', 'sent', 'paid'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const id = Number(req.params.id);
  const existing = get('SELECT * FROM invoices WHERE id = ?', [id]);
  if (!existing) return res.status(404).json({ error: 'Invoice not found' });

  run('UPDATE invoices SET status = ? WHERE id = ?', [status, id]);

  const invoice = get('SELECT * FROM invoices WHERE id = ?', [id]);
  res.json(invoice);
});

// DELETE /api/invoices/:id
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = get('SELECT * FROM invoices WHERE id = ?', [id]);
  if (!existing) return res.status(404).json({ error: 'Invoice not found' });

  run('DELETE FROM invoice_items WHERE invoice_id = ?', [id]);
  run('DELETE FROM invoices WHERE id = ?', [id]);
  res.json({ message: 'Invoice deleted' });
});

module.exports = router;
