const jwt = require('jsonwebtoken');
const asyncHandlers = require('./async');
const ErrorResponse = require('../utils/ErrorResponse');
const User = require('../models/User');

exports.protect = asyncHandlers(async (req, res, next) => {

  let token;

  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
    token = req.headers.authorization.split(' ')[1];
  }
  // else if(req.cookies.token){
  //   token = req.cookies.token;
  // }

  if(!token){
    return next(new ErrorResponse('Not Authorized..', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return next(new ErrorResponse('Not Authorized..', 401));
  }

})

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if(!roles.includes(req.user.role)){
      return next(new ErrorResponse(`User role ${req.user.role} not authorized to access..`, 403));
    }
    next();
  }
}