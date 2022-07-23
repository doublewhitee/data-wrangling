const user = require('./user')

const router = app => {
  app.use(user.routes(), user.allowedMethods())
}

module.exports = router
