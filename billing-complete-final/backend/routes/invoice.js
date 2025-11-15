const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const mustache = require('mustache');
const { sendInvoiceEmail } = require('../email');

// POST /api/invoice/send  { bill, toEmail }
router.post('/send', auth, async (req, res) => {
  try{
    const { bill, toEmail } = req.body;
    if(!bill) return res.status(400).json({message:'bill required'});
    const template = fs.readFileSync(path.join(__dirname,'..','templates','invoice_template.html'),'utf8');
    const html = mustache.render(template, bill);
    // optionally save PDF using puppeteer or headless browser (omitted for brevity)
    if(toEmail){
      await sendInvoiceEmail(toEmail, 'Your Invoice', html);
      return res.json({ sent: true });
    } else {
      return res.json({ html });
    }
  }catch(err){
    console.error(err);
    res.status(500).json({message:err.message});
  }
});

module.exports = router;
