let express = require('express');
let router = express.Router()
let multer = require('multer')
let foodController = require('../controllers/food.controller')  
let authMiddleware = require('../middlewares/auth.middleware')


 let upload = multer({storage:multer.memoryStorage()}) 


// post/api/food/ [protected route]
router.post('/',authMiddleware.authPartnerMiddleware,
    upload.single('video'),
    foodController.createFood)
router.delete('/:foodId', authMiddleware.authPartnerMiddleware, foodController.deleteFood)
router.post('/:foodId/like', authMiddleware.authUserMiddleware, foodController.toggleLike)
router.post('/:foodId/save', authMiddleware.authUserMiddleware, foodController.toggleSave)
router.post('/:foodId/comments', authMiddleware.authUserMiddleware, foodController.addComment)


    // get/api/food/ [protected route]

    router.get('/', foodController.getFoodItems)
    router.get('/partner/:partnerId', foodController.getFoodPartnerProfile)
    router.get('/user/profile', authMiddleware.authUserMiddleware, foodController.getUserProfile)

module.exports = router;