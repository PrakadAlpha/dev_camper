const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandlers = require('../middleware/async');
const Review =  require('../models/Review');


exports.getReviews = asyncHandlers(async(req, res, next) => {
  if(req.params.bootcampId){
    const reviews = await Review.find({bootcamp: req.params.bootcampId})
    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  }else{
    res.status(200).json(res.advancedResults);    
  }
});


exports.getReview = asyncHandlers(async(req, res, next) => {
    const review = await Review.findById(req.params.id).populate({
      path: 'bootcamp',
      select: 'name description'
    })
    if(!review){
      return next(new ErrorResponse('No review found with this id..', 404));
    }

    res.status(200).json({success: true, data: review});    
});



exports.addReview = asyncHandlers(async(req, res, next) => {
  
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if(!bootcamp){
    return next(new ErrorResponse('Not a valid bootcamp Id', 400))
  }

  const review = await Review.create(req.body);

  res.status(201).json({success: true, data: review});    
});

exports.updateReview = asyncHandlers(async(req, res, next) => {
  
  let review = await Review.findById(req.params.id);

  if(!review){
    return next(new ErrorResponse('Not a valid review Id', 400))
  }

  if(review.user.id.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(new ErrorResponse('Not authorized to update', 401))
  }

   review = await Review.findByIdAndUpdate(req.params.id, req.body, {
     new: true,
     runValidators: true
   });

  res.status(200).json({success: true, data: review});    
});



exports.deleteReview = asyncHandlers(async(req, res, next) => {

  let review = await Review.findById(req.params.id);

  if(!review){
    return next(new ErrorResponse('No review with this id..', 404));
  }

  if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(new ErrorResponse(`User with id ${req.user.id} not authorized to do this operation`, 401));
  }

  await Review.findByIdAndRemove(req.params.id)
   
  res.status(200).json({success: true, data: {}});   
});
