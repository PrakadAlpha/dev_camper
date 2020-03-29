const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandlers = require('../middleware/async');
const Course = require('../models/Course');
const User = require('../models/User')

//@desc    Get all courses in bootcamps
//@route   GET /api/v1/courses/:bootcampId/courses
//@access  Public
exports.getCourses = asyncHandlers(async(req, res, next) => {
  
  if(req.params.bootcampId){
    const courses = await Course.find({bootcamp: req.params.bootcampId})
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  }else{
    res.status(200).json(res.advancedResults);    
  }
});

//@desc    Get courses by Id
//@route   GET /api/v1/courses/:id
//@access  Public
exports.getCourse = asyncHandlers(async(req, res, next) => {

  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  })

  if(!course){
    return next(new ErrorResponse('No course with this id..', 404));
  }

  res.status(200).json({success: true, data: course});

});

//@desc    Get courses by Id
//@route   POST /api/v1/bootcamps/:bootcampId/courses
//@access  Private
exports.addCourse = asyncHandlers(async(req, res, next) => {

  req.body.bootcamp = req.params.bootcampId;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if(!bootcamp){
    return next(new ErrorResponse('No bootcamp with this id..', 404));
  }

  if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(new ErrorResponse(`User with id ${req.user.id} not authorized to do this operation`, 401));
  }

  const course = await Course.create(req.body);

  res.status(200).json({success: true, data: course});

});


//@desc    Update courses by Id
//@route   PUT /api/v1/courses/:id
//@access  Private
exports.updateCourse = asyncHandlers(async(req, res, next) => {

  let course = await Course.findById(req.params.id);

  if(!course){
    return next(new ErrorResponse('No course with this id..', 404));
  }

  if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(new ErrorResponse(`User with id ${req.user.id} not authorized to do this operation`, 401));
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({success: true, data: course});

});


//@desc    Delete courses by Id
//@route   DELETE /api/v1/courses/:id
//@access  Private
exports.deleteCourse = asyncHandlers(async(req, res, next) => {

  let course = await Course.findById(req.params.id);

  if(!course){
    return next(new ErrorResponse('No course with this id..', 404));
  }

  if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(new ErrorResponse(`User with id ${req.user.id} not authorized to do this operation`, 401));
  }

  await Course.findByIdAndRemove(req.params.id)
   
  res.status(200).json({success: true, data: {}});

});

