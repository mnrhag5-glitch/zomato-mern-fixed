let foodModel = require('../models/fooditem.model');
let foodPartnerModel = require('../models/foodpartner.model');
let jwt = require('jsonwebtoken');
let storageservice = require('../services/storage.services');
let {v4: uuid} = require('uuid')






async function createFood(req,res){  
    let videoUrl = req.body.videoUrl?.trim()

    if (req.file) {
      let fileupload = await storageservice.uploadFile(req.file.buffer, uuid())
      videoUrl = fileupload.url
    }

    if (!videoUrl) {
      return res.status(400).json({
        message: "Please upload a video file or provide a video URL"
      })
    }
    
let foodItem = await foodModel.create({
    name:req.body.name,
    description:req.body.description,
    foodPartner:req.foodPartner._id,
    video:videoUrl,})

res.status(201).json({
    message:"Food Item created successfully",
    foodItem:foodItem
})
}

async function getFoodItems(req,res){
    let foodItems = await foodModel.find({})
    res.status(200).json({
        message:"Food Items retrieved successfully",
        foodItems:foodItems
    })
}

async function getFoodPartnerProfile(req, res) {
    let foodPartner = await foodPartnerModel.findById(req.params.partnerId)

    if (!foodPartner) {
      return res.status(404).json({
        message: 'Food partner not found'
      })
    }

    let foodItems = await foodModel.find({ foodPartner: foodPartner._id })
    let isOwner = false

    if (req.cookies.token) {
      try {
        let decode = jwt.verify(req.cookies.token, process.env.jwt_SECRET)
        isOwner = String(decode.id) === String(foodPartner._id)
      } catch (error) {
        isOwner = false
      }
    }

    res.status(200).json({
      foodPartner: {
        _id: foodPartner._id,
        name: foodPartner.name,
        email: foodPartner.email,
        profileImage: foodPartner.profileImage
      },
        foodItems,
        isOwner
      })
}

async function deleteFood(req, res) {
    let foodItem = await foodModel.findById(req.params.foodId)

    if (!foodItem) {
      return res.status(404).json({ message: 'Food reel not found' })
    }

    if (String(foodItem.foodPartner) !== String(req.foodPartner._id)) {
      return res.status(403).json({ message: 'You can only delete your own reels' })
    }

    await foodModel.findByIdAndDelete(foodItem._id)
    res.status(200).json({ message: 'Food reel deleted successfully' })
}

async function toggleLike(req, res) {
    let foodItem = await foodModel.findById(req.params.foodId)
    if (!foodItem) return res.status(404).json({ message: 'Food reel not found' })
    foodItem.likes = foodItem.likes || []

    let userId = String(req.user._id)
    let likeIndex = foodItem.likes.findIndex((like) => String(like) === userId)
    if (likeIndex === -1) {
      foodItem.likes.push(req.user._id)
    } else {
      foodItem.likes.splice(likeIndex, 1)
    }

    await foodItem.save()

    res.status(200).json({
      liked: likeIndex === -1,
      likesCount: foodItem.likes.length
    })
}

async function addComment(req, res) {
    let text = req.body.text?.trim()
    if (!text) return res.status(400).json({ message: 'Comment cannot be empty' })

    let foodItem = await foodModel.findById(req.params.foodId)
    if (!foodItem) return res.status(404).json({ message: 'Food reel not found' })

    foodItem.comments = foodItem.comments || []
    foodItem.comments.push({ user: req.user._id, text })
    await foodItem.save()
    res.status(201).json({
      comment: {
        text,
        createdAt: foodItem.comments[foodItem.comments.length - 1].createdAt
      },
      comments: foodItem.comments
    })
}

async function toggleSave(req, res) {
    let foodItem = await foodModel.findById(req.params.foodId)
    if (!foodItem) return res.status(404).json({ message: 'Food reel not found' })
    foodItem.savedBy = foodItem.savedBy || []

    let userId = String(req.user._id)
    let savedIndex = foodItem.savedBy.findIndex((savedUser) => String(savedUser) === userId)
    if (savedIndex === -1) foodItem.savedBy.push(req.user._id)
    else foodItem.savedBy.splice(savedIndex, 1)
    await foodItem.save()

    res.status(200).json({
      saved: savedIndex === -1,
      savedCount: foodItem.savedBy.length
    })
}

async function getUserProfile(req, res) {
    if (!req.user) {
      return res.status(401).json({ message: 'User authentication required' })
    }
    let foodItems = await foodModel.find({ savedBy: req.user._id }).sort({ _id: -1 })
    res.status(200).json({
      user: {
        _id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        profileImage: req.user.profileImage
      },
      savedFoodItems: foodItems
    })
}

module.exports = {
    createFood,
    getFoodItems,
    getFoodPartnerProfile,
    deleteFood,
    toggleLike,
    addComment,
    toggleSave,
    getUserProfile
}