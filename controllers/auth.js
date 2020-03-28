const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandlers = require('../middleware/async');
const path = require('path');
const User = require('../models/User');

//@desc    Get all users
//@route   GET /api/v1/auth/register
//@access  Public
exports.register = asyncHandlers(async (req, res, next) => {

  const {name, email, password, role}  = req.body;
  
  const user = await User.create({
    name, email, password, role
  });

  res.status(200).json({success: true});
}) 

exports.login = asyncHandlers(async (req, res, next) => {

  const {email, password}  = req.body;

  if(!email || !password){
    return next(new ErrorResponse('Enter valid creds..', 400));
  }
  
  const user = await User.findOne({email}).select('+password');

  if(!user){
    return next(new ErrorResponse('Invalid Creds..', 400));
  }

  const isMatch = await user.verifyToken(password);

  if(!isMatch){
    return next(new ErrorResponse('Invalid Creds..', 400));
  }

  sendTokenResponse(user, 200, res);

}) 

const sendTokenResponse = (user, statusCode, res) => {
  
  const token = user.getSignedJwtToken();
  
  const options = {
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
    httpOnly: true
  }

  if(process.env.NODE_ENV === 'production'){
    options.secure = true;
  }


  res.status(statusCode)
     .cookie('token', token, options)
     .json({success: true, token: token});
}

exports.getMe = asyncHandlers(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  return res.status(200).json({success: true, data: user});
})