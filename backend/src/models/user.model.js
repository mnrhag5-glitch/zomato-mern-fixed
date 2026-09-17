let mongoose = require('mongoose')

let userSchema = mongoose.Schema({
    fullName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true   // unique isliye taki sbki email different ho
    },
    password:{
        type:String
    },
    profileImage:{
        type:String
    }
},{
    timestamps:true   // isse pta chllta hai ki user kb bna tha kb update hua thg...
}



)

let userModel = mongoose.model('userModel',userSchema)
module.exports = userModel;