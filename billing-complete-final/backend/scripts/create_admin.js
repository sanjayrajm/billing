require('dotenv').config();
const dbModule = require('../db');
const bcrypt = require('bcrypt');

dbModule.init();
const db = dbModule.connect();

const username = process.env.ADMIN_USER || 'admin';
const password = process.env.ADMIN_PASS || 'admin123';

bcrypt.hash(password, 10).then(hash => {
  db.run('INSERT OR REPLACE INTO users (id,username,password,role) VALUES ((SELECT id FROM users WHERE username=?), ?, ?, ?)',
    [username, username, hash, 'admin'],
    function(err){
      if(err) console.error('Create admin error', err);
      else console.log('Admin user created/updated:', username);
      db.close();
    });
});
