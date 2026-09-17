let mongoose = require('mongoose');

let foodPartnerSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    contact:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    profileImage:{
        type:String
    }
})


let foodPartnerModel = mongoose.model('FoodPartner',foodPartnerSchema)
module.exports = foodPartnerModel;