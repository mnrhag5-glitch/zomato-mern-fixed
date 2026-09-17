let express = require('express')
let chatController = require('../controllers/chat.controller')
let authChatMiddleware = require('../middlewares/chat.middleware')

let router = express.Router()
router.use(authChatMiddleware)
router.get('/inbox', chatController.getInbox)
router.get('/unread-count', chatController.getUnreadCount)
router.get('/partner/:partnerId', chatController.getMessages)
router.post('/partner/:partnerId', chatController.sendMessage)
router.patch('/message/:messageId/like', chatController.toggleMessageLike)
router.delete('/message/:messageId', chatController.deleteMessage)

module.exports = router
