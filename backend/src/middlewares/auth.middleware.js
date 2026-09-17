let foodPartnerModel = require('../models/foodpartner.model');
let jwt = require('jsonwebtoken');
let userModel = require('../models/user.model');

async function authPartnerMiddleware(req,res,next){  // middlewre me 3 parameter hote hai
let token = req.cookies.token;  // ye token cookie se le rhe hai
if(!token){
    return res.status(401).json({
        message:"Unauthorized access"
    })
}
try{

   let decode = jwt.verify(token,process.env.jwt_SECRET)  // ye token ko verify kr rha hai jwt secret key se
  if (decode.role === 'user') {
    return res.status(401).json({ message:"Please log in as a food partner" })
  }
   let foodPartner = await foodPartnerModel.findById(decode.id)  // ye token me se id le rha hai aur usse food partner ko find kr rha hai 
  if (!foodPartner) {
    let user = await userModel.findById(decode.id)
    if (user) {
      return res.status(401).json({
        message:"Please log in as a food partner"
      })
    }
    return res.status(401).json({
      message:"Food partner account not found"
    })
  }
  req.foodPartner = foodPartner;  // ye food partner ko res object me store kr rha hai taki next middleware me use kiya ja sake
  next();  // ye next middleware ko call kr rha hai

}catch(err){
   return res.status(401).json({
message:"invalid token"
   })
}

}


async function authUserMiddleware(req,res,next){  // middlewre me 3 parameter hote hai
let token = req.cookies.token;
if(!token){
    return res.status(401).json({
        message:"Unauthorized access"
    })


}
try{
   let decode = jwt.verify(token,process.env.jwt_SECRET)
  if (decode.role === 'partner') {
    return res.status(401).json({ message:"Please log in as a user" })
  }
   let user = await userModel.findById(decode.id)
  if (!user) {
    let foodPartner = await foodPartnerModel.findById(decode.id)
    if (foodPartner) {
      return res.status(401).json({
        message:"Please log in as a user"
      })
    }
    return res.status(401).json({
      message:"User account not found"
    })
  }
  req.user = user;
  next();
}catch(err){
   return res.status(401).json({
message:"invalid token"
   })
}
}

module.exports = {
    authPartnerMiddleware,
    authUserMiddleware
}