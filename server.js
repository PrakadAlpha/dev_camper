const express =require('express');
const dotenv = require('dotenv');
// const logger = require('./middleware/logger');
const morgan = require('morgan');
const connectDB = require('./config/db');
const colors = require('colors');
const errorHandler = require('./middleware/error')



//Setup environment varibles
dotenv.config({path:'./config/config.env'})

//connect to the DB 
connectDB();

const bootcamps = require('./routes/bootcamps');

const app = express();

app.use(express.json());

if(process.env.NODE_ENV === 'development'){
  app.use(morgan('dev'));
}

// app.use(logger);

app.use('/api/v1/bootcamps/', bootcamps)
 
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));

process.on('unhandledRejection', (err, promise) => {
  console.log('Error: '.red.bold, err.message);
  server.close(() => process.exit(1));
})