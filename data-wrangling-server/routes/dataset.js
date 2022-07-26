const router = require('koa-router')()
const dataset_controller = require('../controllers/dataset')

router.prefix('/dataset')

// create dataset
router.post('/create', dataset_controller.create)

// rename dataset
router.post('/edit', dataset_controller.edit)

// delete dataset
router.post('/delete', dataset_controller.delete)

// req dataset list
router.post('/list', dataset_controller.list)

// req dataset detail
router.post('/detail', dataset_controller.detail)

module.exports = router
