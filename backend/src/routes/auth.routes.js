let express = require('express')
let authController = require('../controllers/auth.controller')
let router = express.Router()
let multer = require('multer')
let authMiddleware = require('../middlewares/auth.middleware')
let upload = multer({ storage: multer.memoryStorage() })


// user auth api-----
router.post('/user/register',authController.registerUser)
router.post('/user/login',authController.loginUser)
router.get('/user/logout',authController.logoutUser)

// food partner auth api-----
router.post('/food-partner/register',authController.registerFoodPartner)
router.post('/food-partner/login',authController.loginFoodPartner)
router.get('/food-partner/logout',authController.logoutFoodPartner)
router.get('/me', authController.getCurrentAccount)
router.post('/user/profile-image', authMiddleware.authUserMiddleware, upload.single('profileImage'), authController.uploadUserProfileImage)
router.post('/food-partner/profile-image', authMiddleware.authPartnerMiddleware, upload.single('profileImage'), authController.uploadPartnerProfileImage)





module.exports = router;