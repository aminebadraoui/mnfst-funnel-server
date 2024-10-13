const express = require('express');
const passport = require('passport');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const funnelRoutes = require('./routes/funnels');
const leadRoutes = require('./routes/leads');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

require('./config/passport')(passport, prisma);

app.use('/api/auth', authRoutes);
app.use('/api/funnels', funnelRoutes);
app.use('/api/leads', leadRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));