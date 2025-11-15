const express = require('express');
const router = express.Router();
const dbModule = require('../db');
const auth = require('../middleware/auth');
const db = dbModule.connect();

router.get('/', auth, (req, res) => {
  db.all('SELECT * FROM products ORDER BY name', [], (err, rows) => {
    if(err) return res.status(500).json({message:err.message});
    res.json(rows);
  });
});

router.post('/', auth, (req, res) => {
  const p = req.body;
  if(!p.name) return res.status(400).json({message:'name required'});
  db.get('SELECT id FROM products WHERE name = ?', [p.name], (err, row) => {
    if(err) return res.status(500).json({message:err.message});
    if(row){
      db.run(`UPDATE products SET sku=?, category=?, brand=?, mrp=?, rate=?, discount=?, qty=?, image_data=?, notes=? WHERE id=?`,
        [p.sku, p.category, p.brand, p.mrp || 0, p.rate || 0, p.discount || 0, p.qty || 0, p.imageData || null, p.notes || null, row.id],
        function(err){
          if(err) return res.status(500).json({message:err.message});
          res.json({ updated: true, id: row.id });
        });
    } else {
      db.run(`INSERT INTO products (sku,name,category,brand,mrp,rate,discount,qty,image_data,notes) VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [p.sku, p.name, p.category, p.brand, p.mrp || 0, p.rate || 0, p.discount || 0, p.qty || 0, p.imageData || null, p.notes || null],
        function(err){
          if(err) return res.status(500).json({message:err.message});
          res.json({ created: true, id: this.lastID });
        });
    }
  });
});

router.delete('/:id', auth, (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err){
    if(err) return res.status(500).json({message:err.message});
    res.json({ deleted: true });
  });
});

module.exports = router;
