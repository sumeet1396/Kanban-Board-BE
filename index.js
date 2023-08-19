const dotenv = require('dotenv');
const mongoose = require('mongoose');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
  });
  
dotenv.config({ path: './.env' });
  
const DB = process.env.DB_URL.replace('<PASSWORD>', process.env.MONGO_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log('DB Connection Successful'));

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

//Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

const app = express();
const port = process.env.PORT || 5000;

  const server = app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
  
  process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });