const express =require('express');
const dotenv = require('dotenv');
// const logger = require('./middleware/logger');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error')
const colors = require('colors')
const filesupload = require('express-fileupload');
const path = require('path');
const cookieParser = require('cookie-parser')
const sanitize = require('express-mongo-sanitize')
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');



//Setup environment varibles
dotenv.config({path:'./config/config.env'})

//connect to the DB 
connectDB();

const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app = express();

app.use(express.json());

if(process.env.NODE_ENV === 'development'){
  app.use(morgan('dev'));
}

//Nosql injection
app.use(sanitize());

//precautionary security headers
app.use(helmet());

//CrossSiteScripting
app.use(xss());

//CrossOriginResourceSharing
app.use(cors());

app.use(filesupload());

app.use(cookieParser());

//100 requests per limit
 const limiter = rateLimit({
   windowMs: 10 * 1000 * 60,
   max: 100
 })

 app.use(limiter);

 //http parameter pollution attack
 app.use(hpp());

app.use(express.static(path.join(__dirname, 'public')));

// app.use(logger);

app.use('/api/v1/bootcamps/', bootcamps);
 
app.use('/api/v1/courses/', courses);

app.use('/api/v1/auth/', auth);

app.use('/api/v1/users/', users);

app.use('/api/v1/reviews/', reviews);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));

process.on('unhandledRejection', (err, promise) => {
  console.log('Error: '.red.bold, err.message);
  server.close(() => process.exit(1));
})