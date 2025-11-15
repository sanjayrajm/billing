const express = require('express');
const router = express.Router();
const dbModule = require('../db');
const auth = require('../middleware/auth');
const db = dbModule.connect();

router.get('/', auth, (req, res) => {
  db.all('SELECT * FROM bills ORDER BY date DESC LIMIT 200', [], (err, rows) => {
    if(err) return res.status(500).json({message:err.message});
    res.json(rows);
  });
});

router.post('/', auth, (req, res) => {
  const b = req.body;
  db.run('INSERT INTO bills (bill_no,date,customer,phone,subtotal,gst,total,paid,due) VALUES (?,?,?,?,?,?,?,?,?)',
    [b.bill_no || '', b.date || new Date().toISOString(), b.customer||'', b.phone||'', b.subtotal||0, b.gst||0, b.total||0, b.paid||0, b.due||0],
    function(err){
      if(err) return res.status(500).json({message:err.message});
      const billId = this.lastID;
      const items = b.items || [];
      const stmt = db.prepare('INSERT INTO bill_items (bill_id, product_name, mrp, rate, discount, qty, total) VALUES (?,?,?,?,?,?,?)');
      items.forEach(it => stmt.run([billId, it.name, it.mrp||0, it.rate||0, it.discount||0, it.qty||0, it.total||0]));
      stmt.finalize();
      res.json({ created: true, id: billId });
    });
});

module.exports = router;
