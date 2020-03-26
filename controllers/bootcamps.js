const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandlers = require('../middleware/async');
const geocoder = require('../utils/geocoder');
//@desc    Get all bootcamps
//@route   GET /api/v1/bootcamps
//@access  Public
exports.getBootcamps = asyncHandlers(async(req, res, next) => {

  let query;

  let reqQuery = {...req.query};

  let removeFields = ['select', 'sort', 'page', 'limit'];

  removeFields.forEach(param => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  //url?averageCost[gte]=1000&location=boston or same like queries
  //url?careers[in]=Business
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/, match => `$${match}`);

  query = Bootcamp.find(JSON.parse(queryStr));

  if(req.query.select){
    let fields = req.query.select.split(',').join(' ');
    query.select(fields);
  }

  if(req.query.sort){
    let sortBy = req.query.sort.split(',').join(' ');    
    query = query.sort(sortBy);
  }else{
    query = query.sort('-createdAt');
  }

  let page = +req.query.page || 1;
  let limit = +req.query.limit || 25;
  let startIndex = (page - 1) * limit;
  let endIndex = page * limit;
  let total = await Bootcamp.countDocuments();

  let pagination = {};

  if(endIndex < total){
    pagination.next = {
    page: page + 1,
    limit
    }
  }

  if(startIndex > 0){
    pagination.prev = {
    page: page - 1,
    limit
    }
  }


  query = query.skip(startIndex).limit(limit);

  const bootcamps = await query;

  res.status(200).send({success:true, count: bootcamps.length, pagination, data: bootcamps});   
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