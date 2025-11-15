const express = require('express');
const router = express.Router();
const dbModule = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const db = dbModule.connect();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if(!username || !password) return res.status(400).json({ message: 'username and password required' });
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
    if(err) { console.error(err); return res.status(500).json({message:'DB error'}); }
    if(!row) return res.status(401).json({message:'User not found'});
    bcrypt.compare(password, row.password).then(match => {
      if(!match) return res.status(401).json({message:'Invalid credentials'});
      const user = { id: row.id, username: row.username, role: row.role };
      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
      res.json({ token, user });
    });
  });
});

router.post('/register', (req, res) => {
  const { username, password, role } = req.body;
  if(!username || !password) return res.status(400).json({message:'username & password required'});
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds).then(hash => {
    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hash, role||'cashier'], function(err){
      if(err) return res.status(500).json({message:err.message});
      res.json({ id: this.lastID, username, role: role||'cashier' });
    });
  });
});

module.exports = router;
