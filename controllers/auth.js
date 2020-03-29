const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandlers = require('../middleware/async');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto');
const bcrypt = require('bcrypt');
//@desc    Get all users
//@route   GET /api/v1/auth/register
//@access  Public
exports.register = asyncHandlers(async (req, res, next) => {

  const {name, email, password, role}  = req.body;
  
  const user = await User.create({
    name, email, password, role
  });

  const token = user.getSignedJwtToken();

  res.status(200).json({success: true, token: token});
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

exports.forgotPassword = asyncHandlers(async (req, res, next) => {

  const user = await User.findOne({email: req.body.email});
  if(!user){
    return next(new ErrorResponse('No User Found', 404));
  }

  const resetToken = user.getPasswordResetToken();

  await user.save({validateBeforeSave: false});

  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

  const  message = `Kindly send a put request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({email: user.email, 
                     subject: 'Password reset token',
                     message
                     })
    return res.status(200).json({success: true, data: 'Email Sent'});
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({validateBeforeSave: false});    
    return next(new ErrorResponse('Email could not be sent', 500));
  }
})

exports.resetPassword = asyncHandlers(async (req, res, next) => {

  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

  const user = await User.findOne({resetPasswordToken, resetPasswordExpire: {$gt: Date.now()}});

  if(!user){
    return next(new ErrorResponse('Invalid Token', 400));
  }

  user.password = req.body.password;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save({validateBeforeSave: false});

  // sendTokenResponse(user, 200, res);
  const token = user.getSignedJwtToken();

  return res.status(200).json({success: true, token: token});

});

exports.updateDetails = asyncHandlers(async (req, res, next) => {
 
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  }

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  return res.status(200).json({success: true, data: user});

})


exports.updatePassword = asyncHandlers(async (req, res, next) => {
 
  const user = await User.findById(req.user.id).select('+password');

  if(!(await user.verifyToken(req.body.currentPassword))){
    return next(new ErrorResponse('Password is incorrect..', 401));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendTokenResponse(user, 200, res);

})

exports.logout = asyncHandlers(async (req, res, next) => {

  res.cookie('token', "none", {expires: new Date(Date.now() + 10 * 1000), httpOnly: true});

  return res.status(200).json({success: true, data:{}});
})
