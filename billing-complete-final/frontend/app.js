// frontend/app.js
// Advanced billing frontend — communicates with backend API and supports offline localStorage fallback.

const API_BASE = '/api';
const productsKey = 'billing_products_v1';
const billsKey = 'billing_bills_v1';
const billCounterKey = 'billing_bill_counter_v1';

// DOM refs
const tabs = document.querySelectorAll('.tab');
const billingTab = document.getElementById('billingTab');
const printTab = document.getElementById('printTab');
const productsTab = document.getElementById('productsTab');
const suggestions = document.getElementById('suggestions');
const itemsTbody = document.querySelector('#itemsTable tbody');
const productList = document.getElementById('productList');

let products = loadProducts();
let items = [];
let settings = { gst: 18 };

// Tab handling
tabs.forEach(t=>t.addEventListener('click', ()=>{
  tabs.forEach(x=>x.classList.remove('active'));
  t.classList.add('active');
  const tab = t.dataset.tab;
  billingTab.style.display = tab==='billingTab' ? '' : 'none';
  printTab.style.display = tab==='printTab' ? '' : 'none';
  productsTab.style.display = tab==='productsTab' ? '' : 'none';
  if(tab==='printTab') refreshPrintPreview();
}));

// Helpers
function saveProductsLocal(){ localStorage.setItem(productsKey, JSON.stringify(products)); }
function loadProducts(){ try{ return JSON.parse(localStorage.getItem(productsKey)) || {}; }catch(e){ return {}; } }
function num(v){ return (parseFloat(v)||0).toFixed(2); }

// Render products
function renderProducts(filter=''){
  productList.innerHTML = '';
  const arr = Object.values(products).sort((a,b)=> (a.name||'').localeCompare(b.name||''));
  arr.filter(p=>!filter || (p.name||'').toLowerCase().includes(filter.toLowerCase()) || (p.brand||'').toLowerCase().includes(filter.toLowerCase())).forEach(p=>{
    const d = document.createElement('div'); d.style.padding='8px'; d.style.borderBottom='1px solid #f2f2f2';
    d.style.cursor='pointer';
    d.innerHTML = `<strong>${escapeHtml(p.name)}</strong><div style="font-size:13px;color:#666">Rate: ₹${num(p.rate)} • Qty: ${p.qty||0}</div>`;
    d.addEventListener('click', ()=> loadProductToForm(p));
    productList.appendChild(d);
  });
}

function loadProductToForm(p){
  document.getElementById('p_sku').value = p.sku || '';
  document.getElementById('p_name').value = p.name || '';
  document.getElementById('p_cat').value = p.category || '';
  document.getElementById('p_brand').value = p.brand || '';
  document.getElementById('p_mrp').value = p.mrp || '';
  document.getElementById('p_rate').value = p.rate || '';
  document.getElementById('p_discount').value = p.discount || '';
  document.getElementById('p_qty').value = p.qty || '';
  const prev = document.getElementById('p_preview'); prev.innerHTML = '';
  if(p.imageData){ const img = new Image(); img.src = p.imageData; img.style.maxWidth='100%'; prev.appendChild(img); }
}

// Suggestions
document.getElementById('itemName').addEventListener('input', (e)=>{
  const q = e.target.value.trim().toLowerCase();
  if(!q){ suggestions.style.display='none'; return; }
  suggestions.innerHTML=''; let found=false;
  Object.values(products).filter(p => (p.name||'').toLowerCase().includes(q) || (p.brand||'').toLowerCase().includes(q)).slice(0,20).forEach(p=>{
    found=true;
    const el = document.createElement('div'); el.style.padding='8px'; el.style.borderBottom='1px solid #f2f2f2'; el.style.cursor='pointer';
    el.innerHTML = `<strong>${escapeHtml(p.name)}</strong> <small style="color:#666">₹${num(p.rate)}</small>`;
    el.addEventListener('click', ()=> {
      document.getElementById('itemName').value = p.name || '';
      document.getElementById('itemMrp').value = p.mrp || '';
      document.getElementById('itemRate').value = p.rate || '';
      document.getElementById('itemDisc').value = p.discount || '';
      document.getElementById('itemQty').value = 1;
      suggestions.style.display='none';
    });
    suggestions.appendChild(el);
  });
  suggestions.style.display = found ? 'block' : 'none';
});

// Add item
document.getElementById('addItem').addEventListener('click', addItem);
function addItem(){
  const name = document.getElementById('itemName').value.trim();
  if(!name){ alert('Item name required'); return; }
  const mrp = parseFloat(document.getElementById('itemMrp').value||0) || 0;
  const rate = parseFloat(document.getElementById('itemRate').value||0) || 0;
  const disc = parseFloat(document.getElementById('itemDisc').value||0) || 0;
  const qty = parseInt(document.getElementById('itemQty').value||0) || 0;
  const total = +(rate * qty * (1 - disc/100)).toFixed(2);
  items.push({name, mrp, rate, discount:disc, qty, total});
  renderItems();
  document.getElementById('itemName').value=''; document.getElementById('itemMrp').value=''; document.getElementById('itemRate').value=''; document.getElementById('itemDisc').value=''; document.getElementById('itemQty').value=1;
}

function renderItems(){
  itemsTbody.innerHTML = '';
  items.forEach((it, idx)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${escapeHtml(it.name)}</td><td>₹ ${num(it.mrp)}</td><td>₹ ${num(it.rate)}</td><td>${num(it.discount)}%</td><td>${it.qty}</td><td>₹ ${num(it.total)}</td><td><button onclick="editItem(${idx})" class="small">Edit</button> <button onclick="delItem(${idx})" class="small">Del</button></td>`;
    itemsTbody.appendChild(tr);
  });
  updateTotals();
}
window.editItem = function(i){ const it = items[i]; const newName = prompt('Item name:', it.name); if(newName===null) return; const mrp = parseFloat(prompt('MRP:', it.mrp)||it.mrp); const rate = parseFloat(prompt('Rate:', it.rate)||it.rate); const disc = parseFloat(prompt('Discount%:', it.discount)||it.discount); const qty = parseInt(prompt('Qty:', it.qty)||it.qty); items[i] = { name:newName, mrp, rate, discount:disc, qty, total: +(rate*qty*(1 - disc/100)).toFixed(2) }; renderItems(); }
window.delItem = function(i){ items.splice(i,1); renderItems(); }

// Totals & PDF
function updateTotals(){
  const sub = items.reduce((s,it)=> s + (it.total||0), 0);
  const gst = parseFloat(document.getElementById('gst').value||0) || 0;
  const gstVal = +(sub * gst/100).toFixed(2);
  const total = +(sub + gstVal).toFixed(2);
  document.getElementById('subtotal').textContent = num(sub);
  document.getElementById('gstVal').textContent = num(gstVal);
  document.getElementById('total').textContent = num(total);
  const paid = parseFloat(document.getElementById('paid').value||0) || 0;
  document.getElementById('due').textContent = num(Math.max(0, total - paid));
}
document.getElementById('gst').addEventListener('input', updateTotals);
document.getElementById('paid').addEventListener('input', updateTotals);

document.getElementById('savePdfBtn').addEventListener('click', async ()=>{
  refreshPrintPreview();
  try{
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({unit:'pt', format:'a4'});
    const lines = document.getElementById('printPreview').textContent.split('\n');
    let y = 40;
    doc.setFont('Courier');
    doc.setFontSize(10);
    lines.forEach(line=>{
      doc.text(String(line), 40, y);
      y += 12;
      if(y > doc.internal.pageSize.getHeight() - 60){ doc.addPage(); y = 40; }
    });
    const filename = `bill_${Date.now()}.pdf`;
    doc.save(filename);
    saveBillLocal();
    alert('Saved PDF: ' + filename);
  }catch(e){ alert('Failed to save PDF: '+e); }
});

function refreshPrintPreview(){
  const lines = [];
  lines.push('muthuganesan Textiles');
  lines.push('103 b kamachiamman sanathi street kanchipuram');
  lines.push('='.repeat(60));
  lines.push(`Date: ${new Date().toLocaleString()}`);
  lines.push('='.repeat(60));
  lines.push('Item                     MRP    Rate  Disc%  Qty     Total');
  lines.push('-'.repeat(60));
  items.forEach(i=>{
    const n = (i.name||'').substring(0,24).padEnd(24,' ');
    const mrp = num(i.mrp).padStart(6);
    const rate = num(i.rate).padStart(7);
    const disc = num(i.discount).padStart(6);
    const qty = String(i.qty).padStart(4);
    const tot = num(i.total).padStart(10);
    lines.push(`${n}${mrp}${rate}${disc}${qty}${tot}`);
  });
  lines.push('-'.repeat(60));
  lines.push(`SubTotal: ₹ ${document.getElementById('subtotal').textContent}`);
  lines.push(`GST: ₹ ${document.getElementById('gstVal').textContent}`);
  lines.push(`Total: ₹ ${document.getElementById('total').textContent}`);
  lines.push(`Paid: ₹ ${document.getElementById('paid').value||0}  Due: ₹ ${document.getElementById('due').textContent}`);
  document.getElementById('printPreview').textContent = lines.join('\n');
}

function saveBillLocal(){
  const bills = JSON.parse(localStorage.getItem(billsKey) || '[]');
  const billNo = getNextBillNo();
  const sub = parseFloat(document.getElementById('subtotal').textContent||0);
  const gst = parseFloat(document.getElementById('gstVal').textContent||0);
  const total = parseFloat(document.getElementById('total').textContent||0);
  const paid = parseFloat(document.getElementById('paid').value||0);
  const due = Math.max(0, total - paid);
  const bill = { bill_no:billNo, date:new Date().toISOString(), customer: document.getElementById('custName').value||'Customer', phone: document.getElementById('custPhone').value||'', subtotal:sub, gst, total, paid, due, items: items.slice() };
  bills.push(bill);
  localStorage.setItem(billsKey, JSON.stringify(bills));
}

function getNextBillNo(){ let n = parseInt(localStorage.getItem(billCounterKey) || '0',10); n += 1; localStorage.setItem(billCounterKey, String(n)); return 'BILL-' + String(n).padStart(6,'0'); }

document.getElementById('saveProduct').addEventListener('click', ()=>{
  const name = document.getElementById('p_name').value.trim();
  if(!name){ alert('Product name required'); return; }
  const p = { sku: document.getElementById('p_sku').value.trim(), name, category: document.getElementById('p_cat').value.trim(), brand: document.getElementById('p_brand').value.trim(), mrp: parseFloat(document.getElementById('p_mrp').value||0) || 0, rate: parseFloat(document.getElementById('p_rate').value||0) || 0, discount: parseFloat(document.getElementById('p_discount').value||0) || 0, qty: parseInt(document.getElementById('p_qty').value||0) || 0 };
  const file = document.getElementById('p_image').files[0];
  if(file){ const fr = new FileReader(); fr.onload = ()=> { p.imageData = fr.result; products[name.toLowerCase()] = p; saveProductsLocal(); renderProducts(); syncProductToServer(p); alert('Product saved'); }; fr.readAsDataURL(file); } else { const old = products[name.toLowerCase()] || {}; if(old.imageData) p.imageData = old.imageData; products[name.toLowerCase()] = p; saveProductsLocal(); renderProducts(); syncProductToServer(p); alert('Saved'); }
});

document.getElementById('exportCsv').addEventListener('click', ()=>{
  const arr = Object.values(products);
  const csv = toCsv(arr);
  downloadText(csv, 'products.csv', 'text/csv');
});

function toCsv(arr){ if(!arr.length) return ''; const keys = Object.keys(arr[0]); const lines = [keys.join(',')]; arr.forEach(r=> lines.push(keys.map(k=> `"${String(r[k]||'').replace(/"/g,'""')}"`).join(','))); return lines.join('\n'); }
function csvToObjects(csv){ const rows=csv.replace(/\r/g,'').split('\n').filter(Boolean); if(!rows.length) return []; const headers=rows[0].split(',').map(h=>h.replace(/(^"|"$)/g,'').trim()); return rows.slice(1).map(r=>{ const cols = r.split(','); const obj={}; headers.forEach((h,i)=> obj[h]= (cols[i]||'').replace(/(^"|"$)/g,'').trim()); return obj; });}
function downloadText(text, filename, mime){ const blob = new Blob([text], {type: mime||'text/plain'}); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename; a.click(); setTimeout(()=>URL.revokeObjectURL(url),2000); }
function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&<>"']/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function num(v){ return (parseFloat(v)||0).toFixed(2); }

// sync
async function doSync(){
  const token = localStorage.getItem('billing_jwt');
  if(!token){ alert('Login required to sync'); return; }
  try{
    for(const p of Object.values(products)){ await fetch(API_BASE + '/products', {method:'POST', headers:{'Content-Type':'application/json', 'Authorization':'Bearer ' + token}, body: JSON.stringify(p)}); }
    const bills = JSON.parse(localStorage.getItem(billsKey) || '[]');
    for(const b of bills){ await fetch(API_BASE + '/bills', {method:'POST', headers:{'Content-Type':'application/json', 'Authorization':'Bearer ' + token}, body: JSON.stringify(b)}); }
    alert('Sync complete');
  }catch(e){ alert('Sync failed: ' + e); }
}
