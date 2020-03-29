const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandlers = require('../middleware/async');
const User = require('../models/User');

exports.getUsers = asyncHandlers(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
}) 


exports.getUser = asyncHandlers(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.status(200).json({success: true, data: user});
}) 

exports.createUser = asyncHandlers(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(201).json({success: true, data: user});
}) 

exports.updateUser = asyncHandlers(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id,req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({success: true, data: user});
}) 

exports.deleteUser = asyncHandlers(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({success: true, data: {}});
}) 