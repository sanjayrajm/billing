const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const mustache = require('mustache');
const puppeteer = require('puppeteer');
const { sendInvoiceEmail } = require('../email');

// POST /api/invoice/pdf  { bill, toEmail (optional) }
router.post('/pdf', auth, async (req, res) => {
  try{
    const { bill, toEmail } = req.body;
    if(!bill) return res.status(400).json({message:'bill required'});
    const template = fs.readFileSync(path.join(__dirname,'..','templates','invoice_template.html'),'utf8');
    const html = mustache.render(template, bill);

    // Launch headless browser to render PDF
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' } });
    await browser.close();

    if(toEmail){
      // send email with attachment
      await sendInvoiceEmail(toEmail, `Invoice ${bill.bill_no || ''}`, html, [{ filename: `invoice_${bill.bill_no || Date.now()}.pdf`, content: pdfBuffer }]);
      return res.json({ sent: true });
    } else {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice_${bill.bill_no || Date.now()}.pdf`);
      return res.send(pdfBuffer);
    }
  }catch(err){
    console.error(err);
    res.status(500).json({message:err.message});
  }
});

module.exports = router;
