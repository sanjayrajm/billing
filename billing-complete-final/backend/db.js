const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'billing.db');

function connect(){
  const db = new sqlite3.Database(DB_FILE);
  return db;
}

function init(){
  if(!fs.existsSync(DB_FILE)){
    const db = connect();
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT
      );`);

      db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT,
        name TEXT UNIQUE,
        category TEXT,
        brand TEXT,
        mrp REAL,
        rate REAL,
        discount REAL,
        qty INTEGER,
        image_data TEXT,
        notes TEXT
      );`);

      db.run(`CREATE TABLE IF NOT EXISTS bills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bill_no TEXT,
        date TEXT,
        customer TEXT,
        phone TEXT,
        subtotal REAL,
        gst REAL,
        total REAL,
        paid REAL,
        due REAL
      );`);

      db.run(`CREATE TABLE IF NOT EXISTS bill_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bill_id INTEGER,
        product_name TEXT,
        mrp REAL,
        rate REAL,
        discount REAL,
        qty INTEGER,
        total REAL
      );`);
    });
    db.close();
    console.log('DB initialized at', DB_FILE);
  }
}

module.exports = { connect, init, DB_FILE };
