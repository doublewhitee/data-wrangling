const user = require('./user')
const project = require('./project')

const router = app => {
  app.use(user.routes(), user.allowedMethods())
  app.use(project.routes(), project.allowedMethods())
}

module.exports = router
