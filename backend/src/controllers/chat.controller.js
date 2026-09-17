let messageModel = require('../models/message.model')
let foodPartnerModel = require('../models/foodpartner.model')

async function getMessages(req, res) {
  let partner = await foodPartnerModel.findById(req.params.partnerId)
  if (!partner) return res.status(404).json({ message: 'Food partner not found' })

  let userId = req.actor.role === 'user' ? req.actor.id : req.query.userId
  if (!userId) return res.status(400).json({ message: 'User is required for partner chat' })

  let messages = await messageModel.find({
    user: userId,
    foodPartner: partner._id
  }).sort({ createdAt: 1 })
  messages.forEach((message) => {
    message.likedBy = message.likedBy || []
    message.readBy = message.readBy || []
  })
  await messageModel.updateMany({
    user: userId,
    foodPartner: partner._id,
    senderRole: { $ne: req.actor.role },
    readBy: { $ne: req.actor.role }
  }, { $addToSet: { readBy: req.actor.role } })

  res.status(200).json({ messages })
}

async function getUnreadCount(req, res) {
  let query = req.actor.role === 'partner'
    ? { foodPartner: req.actor.id, senderRole: 'user', readBy: { $ne: 'partner' } }
    : { user: req.actor.id, senderRole: 'partner', readBy: { $ne: 'user' } }
  let unreadCount = await messageModel.countDocuments(query)
  res.status(200).json({ unreadCount })
}

async function sendMessage(req, res) {
  let partner = await foodPartnerModel.findById(req.params.partnerId)
  if (!partner) return res.status(404).json({ message: 'Food partner not found' })

  let userId = req.actor.role === 'user' ? req.actor.id : req.body.userId
  let text = req.body.text?.trim()
  if (!userId || !text) return res.status(400).json({ message: 'Message and user are required' })

  let message = await messageModel.create({
    user: userId,
    foodPartner: partner._id,
    senderRole: req.actor.role,
    text
  })
  res.status(201).json({ message })
}

async function toggleMessageLike(req, res) {
  let message = await messageModel.findById(req.params.messageId)
  if (!message) return res.status(404).json({ message: 'Message not found' })
  if (String(message.user) !== String(req.actor.id) && String(message.foodPartner) !== String(req.actor.id)) {
    return res.status(403).json({ message: 'You are not part of this chat' })
  }

  message.likedBy = message.likedBy || []
  let existing = message.likedBy.findIndex((like) => String(like.id) === String(req.actor.id) && like.role === req.actor.role)
  if (existing === -1) message.likedBy.push({ id: req.actor.id, role: req.actor.role })
  else message.likedBy.splice(existing, 1)
  await message.save()
  res.status(200).json({ liked: existing === -1, message })
}

async function deleteMessage(req, res) {
  let message = await messageModel.findById(req.params.messageId)
  if (!message) return res.status(404).json({ message: 'Message not found' })
  if (String(message.user) !== String(req.actor.id) && String(message.foodPartner) !== String(req.actor.id)) {
    return res.status(403).json({ message: 'You are not part of this chat' })
  }
  await messageModel.findByIdAndDelete(message._id)
  res.status(200).json({ message: 'Message deleted' })
}

async function getInbox(req, res) {
  let query = req.actor.role === 'partner'
    ? { foodPartner: req.actor.id }
    : { user: req.actor.id }
  let messages = await messageModel.find(query)
    .sort({ createdAt: -1 })
    .populate('user', 'fullName')
    .populate('foodPartner', 'name')
  let conversations = []
  let seen = new Set()
  messages.forEach((message) => {
    if (!message.user) return
    let conversationId = req.actor.role === 'partner'
      ? String(message.user._id)
      : String(message.foodPartner?._id)
    if (conversationId && !seen.has(conversationId)) {
      seen.add(conversationId)
      conversations.push({
        userId: message.user._id,
        userName: message.user.fullName,
        partnerId: message.foodPartner?._id,
        partnerName: message.foodPartner?.name,
        preview: message.text,
        updatedAt: message.createdAt
      })
    }
  })
  res.status(200).json({ conversations })
}

module.exports = { getMessages, sendMessage, toggleMessageLike, deleteMessage, getInbox, getUnreadCount }
