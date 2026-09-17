let mongoose = require('mongoose');

let foodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  video:{
    type:String,
    required:true,
  },
  description: {
    type: String,
    
  },
  foodPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodPartner',
   
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userModel'
  }],
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userModel'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'userModel'
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

});

let foodModel = mongoose.model('FoodItem', foodItemSchema);
module.exports = foodModel;