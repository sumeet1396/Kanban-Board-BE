const dotenv = require('dotenv');
const mongoose = require('mongoose');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const morgan = require('morgan');
const cors = require('cors');

process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
  });
  
dotenv.config({ path: './.env' });
  
const DB = process.env.DB_URL.replace('<PASSWORD>', process.env.MONGO_PASSWORD);

const AppError = require('./utils/appError');
const userRouter = require('./routes/userRoutes');

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log('DB Connection Successful'));

const app = express();
const port = process.env.PORT || 5000;


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

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

app.use(morgan('dev'));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Use the cors middleware
app.use(cors());

const allowedOrigins = ['http://127.0.0.1:5173','http://localhost:5137'];
app.use(cors({
    origin: allowedOrigins, // Replace with your allowed origin
  }));


// ping api
app.get("/ping", (req, res) => {
    res.send('PING')
})

app.use('/kanban/api/v1/users', userRouter);

//404 url error handler for all http request methods
app.all('*', (req, res, next) => {
    next(new AppError(`Can't found ${req.originalUrl} on the server`, 404));
  });

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