const user = require('./user')
const project = require('./project')
const dataset = require('./dataset')

const router = app => {
  app.use(user.routes(), user.allowedMethods())
  app.use(project.routes(), project.allowedMethods())
  app.use(dataset.routes(), dataset.allowedMethods())
}

module.exports = router
