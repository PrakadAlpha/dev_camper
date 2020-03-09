const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandlers = require('../middleware/async');
//@desc    Get all bootcamps
//@route   GET /api/v1/bootcamps
//@access  Public
exports.getBootcamps = asyncHandlers(async(req, res, next) => {
  const bootcamps = await Bootcamp.find();
  res.status(200).send({success:true, count: bootcamps.length, data: bootcamps});   
});

//@desc    Get single bootcamps
//@route   GET /api/v1/bootcamps/:id
//@access  Public
exports.getBootcamp = asyncHandlers(async(req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id);
    if(!bootcamp){
    return next(new ErrorResponse(`Bootcamp with id ${req.params.id} not found`, 404));
    } 
    res.status(200).json({success:true, data: bootcamp}); 
  });

//@desc    Create bootcamp
//@route   POST /api/v1/bootcamps/
//@access  Private
exports.createBootcamp =  asyncHandlers(async (req, res, next) => {
 
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({success:true, data: bootcamp}); 

});

//@desc    Update single bootcamp
//@route   PUT /api/v1/bootcamps/:id
//@access  Private
exports.updateBootcamp = asyncHandlers(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if(!bootcamp){
      return next(new ErrorResponse(`Bootcamp with id ${req.params.id} not found`, 404));
    }

    res.status(200).json({success:true, data: bootcamp}); 

  });

//@desc    Delete a bootcamp
//@route   DELETE /api/v1/bootcamps/:id
//@access  Private
exports.deleteBootcamp = asyncHandlers(async(req, res, next) => {
  
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    if(!bootcamp){
      return next(new ErrorResponse(`Bootcamp with id ${req.params.id} not found`, 404));
    }

    res.status(200).json({success:true, data: bootcamp}); 
});