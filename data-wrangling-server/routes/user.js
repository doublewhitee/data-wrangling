const router = require('koa-router')()
const user_controller = require('../controllers/user')

router.prefix('/user')

// register
router.post('/register', user_controller.register)

// login
router.post('/login', user_controller.login)

// user info
router.get('/info', user_controller.info)

module.exports = router
