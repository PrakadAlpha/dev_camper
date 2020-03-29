const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandlers = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const path = require('path');
//@desc    Get all bootcamps
//@route   GET /api/v1/bootcamps
//@access  Public
exports.getBootcamps = asyncHandlers(async(req, res, next) => {
  res.status(200).json(res.advancedResults);
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
 
  req.body.user = req.user.id;  

  let publishedBootcamps = await Bootcamp.findOne({user: req.user.id});

  if(publishedBootcamps && req.user.role !== 'admin'){
    return next(new ErrorResponse(`User with this id has already published a bootcamp..`, 400));
  }

  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({success:true, data: bootcamp}); 

});

//@desc    Update single bootcamp
//@route   PUT /api/v1/bootcamps/:id
//@access  Private
exports.updateBootcamp = asyncHandlers(async (req, res, next) => {
    let bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id);

    if(!bootcamp){
      return next(new ErrorResponse(`Bootcamp with id ${req.params.id} not found`, 404));
    }

    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
      return next(new ErrorResponse(`User with id ${req.user.id} not authorized to do this operation`, 401));
    }

    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({success:true, data: bootcamp}); 

  });

//@desc    Delete a bootcamp
//@route   DELETE /api/v1/bootcamps/:id
//@access  Private
exports.deleteBootcamp = asyncHandlers(async(req, res, next) => {
  
    const bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp){
      return next(new ErrorResponse(`Bootcamp with id ${req.params.id} not found`, 404));
    }

    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
      return next(new ErrorResponse(`User with id ${req.user.id} not authorized to do this operation`, 401));
    }

    bootcamp.remove(); // To trigger the pre('remove') middleware

    res.status(200).json({success:true, data: bootcamp}); 
});

exports.getBootcampsInRadius = asyncHandlers(async(req, res, next) => {
  
  const {zipCode, distance} = req.params;

  const loc = await geocoder.geocode(zipCode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  //Earth radius = 3,963mi / 6,378km
  const radius = distance / 6378;

  const bootcamps = await Bootcamp.find({
    location: {$geoWithin: {$centerSphere: [[lng, lat], radius]}}
  });

  res.status(200).json({success:true, count: bootcamps.length, data: bootcamps}); 
});

//@desc    Upload photo for bootcamp
//@route   PUT /api/v1/bootcamps/:id/photo
//@access  Private
exports.photoUploadBootcamp = asyncHandlers(async(req, res, next) => {
  
  const bootcamp = await Bootcamp.findById(req.params.id);

  if(!bootcamp){
    return next(new ErrorResponse(`Bootcamp with id ${req.params.id} not found`, 404));
  }

  if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(new ErrorResponse(`User with id ${req.user.id} not authorized to do this operation`, 401));
  }

  if(!req.files){
    return next(new ErrorResponse('Please upload a file..', 400));
  }

  const file = req.files.file;

  if(!file.mimetype.startsWith('image')){
    return next(new ErrorResponse('Please upload an image file.', 400))
  }
  
  if(file.size > process.env.MAX_FILE_SIZE){
    return next(new ErrorResponse('Please upload an image file less than 1mb.', 400))
  }

  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if(err){
      console.log(err);
      return next(new ErrorResponse('Problem with uploading image', 500))
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name});

  res.status(200).json({success:true, data: file.name}); 

  })
});