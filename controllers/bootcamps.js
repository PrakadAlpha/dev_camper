//@desc    Get all bootcamps
//@route   GET /api/v1/bootcamps
//@access  Public
exports.getBootcamps = (req, res, next) => {
  res.status(200).send({success:true, data: 'Show all bootcamps'}); 
}

//@desc    Get single bootcamps
//@route   GET /api/v1/bootcamps/:id
//@access  Public
exports.getBootcamp = (req, res, next) => {
  res.status(200).json({success:true, data: `Get bootcamp with id ${req.params.id}`}); 
}

//@desc    Create bootcamp
//@route   POST /api/v1/bootcamps/
//@access  Private
exports.createBootcamp = (req, res, next) => {
  res.status(201).json({success:true, data: 'Create bootcamp'}); 
}

//@desc    Update single bootcamp
//@route   PUT /api/v1/bootcamps/:id
//@access  Private
exports.updateBootcamp = (req, res, next) => {
  res.status(200).json({success:true, data: `Update the bootcamp with id ${req.params.id}`}); 
}

//@desc    Delete a bootcamp
//@route   DELETE /api/v1/bootcamps/:id
//@access  Private
exports.deleteBootcamp = (req, res, next) => {
  res.status(200).json({success:true, data: `Delete the bootcamp with id ${req.params.id}`}); 
}