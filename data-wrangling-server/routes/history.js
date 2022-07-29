const router = require('koa-router')()
const history_controller = require('../controllers/history')

router.prefix('/history')

// history list
router.post('/list', history_controller.list)

module.exports = router
