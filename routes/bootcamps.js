const express = require('express')
const router = express.Router();
const advancedResults = require('../middleware/advancedResults')
const Bootcamp = require('../models/Bootcamp')
const {getBootcamps, 
       getBootcamp, 
       createBootcamp, 
       updateBootcamp, 
       deleteBootcamp,
       getBootcampsInRadius,
       photoUploadBootcamp} = require('../controllers/bootcamps')

const {protect, authorize} = require('../middleware/auth');

//Redirect the courses routes
const courseRouter = require('./courses');
const reviewsRouter = require('./reviews');
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewsRouter);

router.route('/radius/:zipCode/:distance')
      .get(getBootcampsInRadius)

router.route('/')
      .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
      .post(protect, authorize('publisher', 'admin'),createBootcamp);

router.route('/:id/photo')
      .put(protect, authorize('publisher', 'admin'), photoUploadBootcamp);

router.route('/:id')
      .get(getBootcamp)
      .put(protect, authorize('publisher', 'admin'),updateBootcamp)
      .delete(protect, authorize('publisher', 'admin'),deleteBootcamp);

module.exports = router;