let jwt = require('jsonwebtoken')
let userModel = require('../models/user.model')
let foodPartnerModel = require('../models/foodpartner.model')

async function authChatMiddleware(req, res, next) {
  let token = req.cookies.token
  if (!token) return res.status(401).json({ message: 'Please log in to use chat' })

  try {
    let decoded = jwt.verify(token, process.env.jwt_SECRET)
    let user = await userModel.findById(decoded.id)
    if (user && decoded.role !== 'partner') {
      req.actor = { id: user._id, role: 'user' }
      return next()
    }

    let foodPartner = await foodPartnerModel.findById(decoded.id)
    if (foodPartner && decoded.role !== 'user') {
      req.actor = { id: foodPartner._id, role: 'partner' }
      return next()
    }

    return res.status(401).json({ message: 'Invalid chat account' })
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

module.exports = authChatMiddleware
