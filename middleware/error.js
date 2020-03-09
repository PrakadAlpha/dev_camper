
const ErrorResponse = require('../utils/ErrorResponse');

const errorHandler = (err, req, res, next) => {

    let error = {...err};

    error.message = err.message;

    console.log(err);

    //Bootcamp wrong object id
    if(err.name === "CastError"){
      const message = `Bootcamp not found with id ${err.value}`;
      error = new ErrorResponse(message, 404);
    }

    //Duplicate error
    if(err.code === 11000){
      const message = `Duplicate field value entered`;
      error = new ErrorResponse(message, 400);
    }

    //Validation Error
    if(err.name === 'ValidationError'){
      const message = Object.values(err.errors).map(val => val.message);
      error = new ErrorResponse(message, 400);
    }

    res.status(err.statusCode || 500).json({success: false, error: error.message || 'Server Error'});
  }

  module.exports = errorHandler;

