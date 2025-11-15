const express = require('express');
const router = express.Router();
const dbModule = require('../db');
const auth = require('../middleware/auth');
const db = dbModule.connect();

router.get('/', auth, (req, res) => {
  if(req.user.role !== 'admin') return res.status(403).json({message:'Forbidden'});
  db.all('SELECT id, username, role FROM users', [], (err, rows) => {
    if(err) return res.status(500).json({message:err.message});
    res.json(rows);
  });
});

module.exports = router;
