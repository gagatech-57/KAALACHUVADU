const path = require('path');
const express = require('express');
const app = require('../api/index.js');

// Serve static assets in production
app.use(express.static(path.join(__dirname, '../dist')));

// Fallback to index.html for React Router / Single Page App
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
