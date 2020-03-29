const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title:{
      type: String,
      trim: true,
      require: [true, "Please add a title"]
    },
    description: {
      type: String,
      required: [true, "Please add a desciption"]
    },
    weeks: {
      type: String,
      required: [true, "Please add number of weeks"]
    },
    tuition: {
      type: Number,
      required: [true, "Pleassuccess: true, data: coursee add a tution cost"]
    },
    minimumSkill: {
      type: String,
      required: [true, "Please add a minimum skill"],
      enum: ['beginner', 'intermediate', 'advanced']
    },
    scholarshipAvailable: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    bootcamp: {
      type: mongoose.Schema.ObjectId,
      ref: 'Bootcamp',
      require: true
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      require: true
    }
})

courseSchema.statics.getAverageCost = async function(bootcampId){
  const obj = await this.aggregate([
    {$match: {bootcamp: bootcampId}},
    {$group: {_id: '$bootcamp', averageCost: {$avg: '$tuition'}}}
  ]);

  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost/10)*10});
  } catch (error) {
    console.log(error);    
  }
}

courseSchema.post('save', function(){
   this.constructor.getAverageCost(this.bootcamp)
})

courseSchema.pre('remove', function() {
  this.constructor.getAverageCost(this.bootcamp)
})

module.exports = mongoose.model('Course', courseSchema);