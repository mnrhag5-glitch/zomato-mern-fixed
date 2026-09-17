let userModel = require("../models/user.model");
let bcrypt = require("bcryptjs");
let jwt = require("jsonwebtoken");
let foodPartnerModel = require("../models/foodpartner.model");
let storageService = require("../services/storage.services");

const isProduction = process.env.NODE_ENV === "production";

// Cross-site deploy (frontend aur backend alag domain) pe cookie tabhi set hoti hai
// jab sameSite:"none" + secure:true ho. Local pe lax/insecure chahiye.
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

const clearCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

function signToken(payload) {
  if (!process.env.jwt_SECRET) {
    throw new Error("jwt_SECRET is missing in environment variables");
  }
  return jwt.sign(payload, process.env.jwt_SECRET, { expiresIn: "7d" });
}




async function registerUser(req, res) {
  let { fullName, email, password } = req.body;
  let isUserAlradyExist = await userModel.findOne({ email });
  if (isUserAlradyExist) {
    return res.status(400).json({
      message: "User already exist",
    });
  }

  let hashedPassword = await bcrypt.hash(password, 10);
  let user = await userModel.create({
    fullName,
    email,
    password: hashedPassword,
  });

  let token = signToken({ id: user._id, role: 'user' }); // ye secret key hai    // ye token jwt secret web se genratre kiya hua hai...
  res.cookie("token", token, cookieOptions);
  res.status(201).json({
    message: "User registerd successfully",
    user: {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
    },
  });
}


async function loginUser(req, res) {
  let { email, password } = req.body;
  let user = await userModel.findOne({ email });
  if (!user){
    return res.status(400).json({
      message: "invalid email or password",
    });
  }

  let isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({
      message: "invalid email or password",
    });
  }
  let token = signToken({ id: user._id, role: 'user' }); // ye secret key hai    // ye token jwt secret web se genratre kiya hua hai...
  res.cookie("token", token, cookieOptions);
  res.status(200).json({
    message: "User Login Successfully",
    user: {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,    /// hm kbhi bhi password nhi bhejte hai password me
    },
  });
}


function logoutUser(req,res){
    res.clearCookie('token', clearCookieOptions);
    res.status(200).json({
        message:"user logged out successfully"
    })
}


async function registerFoodPartner(req,res){
    let { name,contact,email, password } = req.body;
    let isAccountAlreadyExists = await foodPartnerModel.findOne({ email });
    if(isAccountAlreadyExists){
        return res.status(400).json({
            message:"Food Partner already exists"
        })
    }

 
    let hashedPasssword = await bcrypt.hash(password,10)

     let foodPartner = await foodPartnerModel.create({
  name,
  contact,
  email,
  password: hashedPasssword
     })
     let token = signToken({ id: foodPartner._id, role: 'partner' })
     res.cookie('token', token, cookieOptions)      
 
        res.status(201).json({
            message:"Food Partner registered successfully",
            foodPartner:{
                _id:foodPartner._id,
                name:foodPartner.name,
                contact:foodPartner.contact,
                email:foodPartner.email
            }
        })


}


async function loginFoodPartner(req,res){
    let {email ,password} = req.body;
    let foodPartner = await foodPartnerModel.findOne({email})
    if(!foodPartner){
        return res.status(400).json({
            message:"invalid email or password"
        })
}
  let ispasswordValid = await bcrypt.compare(password,foodPartner.password)
  if(!ispasswordValid){
    return res.status(400).json({
        message:"invalid email or password"
    })
  }

  let token = signToken({ id: foodPartner._id, role: 'partner' })
  res.cookie('token', token, cookieOptions)

  res.status(200).json({
    message:"Food Partner logged in successfully",
    foodPartner:{
      _id:foodPartner._id,
      name:foodPartner.name,
      email:foodPartner.email
    }
  })

}

function logoutFoodPartner(req,res){
    res.clearCookie('token', clearCookieOptions);
    res.status(200).json({
        message:"Food Partner logged out successfully"
    })
}

async function uploadUserProfileImage(req, res) {
  if (!req.file) return res.status(400).json({ message: "Please select an image" })
  let upload = await storageService.uploadFile(req.file.buffer, `user-profile-${req.user._id}`)
  req.user.profileImage = upload.url
  await req.user.save()
  res.status(200).json({ profileImage: upload.url })
}

async function uploadPartnerProfileImage(req, res) {
  if (!req.file) return res.status(400).json({ message: "Please select an image" })
  let upload = await storageService.uploadFile(req.file.buffer, `partner-profile-${req.foodPartner._id}`)
  req.foodPartner.profileImage = upload.url
  await req.foodPartner.save()
  res.status(200).json({ profileImage: upload.url })
}

async function getCurrentAccount(req, res) {
  let token = req.cookies.token
  if (!token) return res.status(401).json({ message: 'Please log in' })

  try {
    let decoded = jwt.verify(token, process.env.jwt_SECRET)
    if (decoded.role === 'partner') {
      let foodPartner = await foodPartnerModel.findById(decoded.id).select('-password')
      if (!foodPartner) return res.status(401).json({ message: 'Food partner account not found' })
      return res.status(200).json({ role: 'partner', account: foodPartner })
    }

    let user = await userModel.findById(decoded.id).select('-password')
    if (!user) {
      let legacyPartner = await foodPartnerModel.findById(decoded.id).select('-password')
      if (legacyPartner) return res.status(200).json({ role: 'partner', account: legacyPartner })
      return res.status(401).json({ message: 'User account not found' })
    }
    return res.status(200).json({ role: 'user', account: user })
  } catch (error) {
    return res.status(401).json({ message: 'Session expired. Please log in again.' })
  }
}


module.exports = {
    logoutFoodPartner,
     registerUser,
     loginUser,
     logoutUser,
     registerFoodPartner,
     loginFoodPartner,
     uploadUserProfileImage,
     uploadPartnerProfileImage
     ,getCurrentAccount
    
    
    };
