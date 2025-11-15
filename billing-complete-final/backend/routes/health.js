const express = require('express');
const router = express.Router();
router.get('/live', (req,res)=> res.json({status:'ok', time: new Date().toISOString()}));
router.get('/ready', (req,res)=> res.json({status:'ready'}));
module.exports = router;
