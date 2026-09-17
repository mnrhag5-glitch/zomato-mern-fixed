let mongoose = require('mongoose')

let messageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userModel',
    required: true
  },
  foodPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodPartner',
    required: true
  },
  senderRole: {
    type: String,
    enum: ['user', 'partner'],
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  likedBy: [{
    id: mongoose.Schema.Types.ObjectId,
    role: {
      type: String,
      enum: ['user', 'partner']
    }
  }],
  readBy: [{
    type: String,
    enum: ['user', 'partner']
  }]
}, { timestamps: true })

module.exports = mongoose.model('Message', messageSchema)
