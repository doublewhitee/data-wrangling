const router = require('koa-router')()
const koaBody = require('koa-body')({ multipart:true }) // parse files
const dataset_controller = require('../controllers/dataset')

router.prefix('/dataset')

// create dataset
router.post('/create', dataset_controller.create)

// import dataset
router.post('/import', koaBody, dataset_controller.import)

// rename dataset
router.post('/edit', dataset_controller.edit)

// delete dataset
router.post('/delete', dataset_controller.delete)

// req dataset list
router.post('/list', dataset_controller.list)

// req dataset detail
router.post('/detail', dataset_controller.detail)

module.exports = router
