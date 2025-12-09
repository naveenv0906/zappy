require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const prisma = require('./config/db.js');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.js');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session'
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

const authRoutes = require('./routes/authRoutes.js');
app.use('/auth', authRoutes);

const profileRoutes = require('./routes/profileRoutes.js');
app.use('/profile', profileRoutes);

const chatRoutes = require('./routes/chatRoutes.js');
app.use('/chat', chatRoutes);

module.exports = app;