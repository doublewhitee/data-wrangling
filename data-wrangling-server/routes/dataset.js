const router = require('koa-router')()
const koaBody = require('koa-body')({ multipart:true }) // parse files
const dataset_controller = require('../controllers/dataset')
const single_table_controller = require('../controllers/singleTable')

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

// change cell value
router.post('/editcell', single_table_controller.editcell)

// rename column
router.post('/renamecol', single_table_controller.renamecol)

// add column
router.post('/addcol', single_table_controller.addcol)

// add row
router.post('/addrow', single_table_controller.addrow)

// delete col
router.post('/deletecol', single_table_controller.deletecol)

// delete row
router.post('/deleterow', single_table_controller.deleterow)

// combine col
router.post('/combinecol', single_table_controller.combinecol)

// combine row
router.post('/combinerow', single_table_controller.combinerow)

// separate columns
router.post('/splitcol', single_table_controller.splitcol)

module.exports = router
