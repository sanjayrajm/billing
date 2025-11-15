require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const dbModule = require('./db');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Sentry = require('./sentry');

dbModule.init();

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET','POST','PUT','DELETE','OPTIONS']
}));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || '120'),
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/bills', require('./routes/bills'));
app.use('/api/users', require('./routes/users'));
app.use('/api/invoice', require('./routes/invoice'));
app.use('/api/invoice', require('./routes/invoice_pdf'));
app.use('/health', require('./routes/health'));

app.use('/', express.static(path.join(__dirname, '..', 'frontend')));

module.exports = app;
