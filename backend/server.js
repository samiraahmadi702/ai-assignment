const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

async function start() {
  // Initialize database before starting server
  await initDatabase();
  // API routes (loaded after DB init)
  const clientRoutes = require('./routes/clients');
  const invoiceRoutes = require('./routes/invoices');

  app.use('/api/clients', clientRoutes);
  app.use('/api/invoices', invoiceRoutes);

  // Serve Angular static files in production
  // Angular 18 application builder outputs to public/browser/
  const staticPath = path.join(__dirname, 'public', 'browser');
  app.use(express.static(staticPath));

  // Fallback: serve index.html for Angular routing
  app.get('*', (req, res) => {
    const indexPath = path.join(staticPath, 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(404).json({ error: 'Not found' });
      }
    });
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
