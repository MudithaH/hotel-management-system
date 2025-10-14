const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const staffRoutes = require('./routes/staffRoutes');


const app = express();

app.use(helmet( {contentSecurityPolicy: false} ));
app.use(cors( {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
} ));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);

module.exports = app;