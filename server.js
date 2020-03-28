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

//Setup environment varibles
dotenv.config({path:'./config/config.env'})

//connect to the DB 
connectDB();

const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');

const app = express();

app.use(express.json());

if(process.env.NODE_ENV === 'development'){
  app.use(morgan('dev'));
}

app.use(filesupload());

app.use(cookieParser());


app.use(express.static(path.join(__dirname, 'public')));

// app.use(logger);

app.use('/api/v1/bootcamps/', bootcamps);
 
app.use('/api/v1/courses/', courses);

app.use('/api/v1/auth/', auth);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));

process.on('unhandledRejection', (err, promise) => {
  console.log('Error: '.red.bold, err.message);
  server.close(() => process.exit(1));
})