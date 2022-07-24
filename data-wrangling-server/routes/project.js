const router = require('koa-router')()
const project_controller = require('../controllers/project')

router.prefix('/project')

// create project
router.post('/create', project_controller.create)

// edit project
router.post('/edit', project_controller.edit)

// delete project
router.post('/delete', project_controller.delete)

// req project list
router.post('/list', project_controller.list)

module.exports = router
