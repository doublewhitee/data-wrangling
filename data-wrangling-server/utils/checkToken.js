const jwt = require('jsonwebtoken')
const config = require('config')

const checkToken = async (ctx, next) => {
  const url = ctx.request.url

  if (url === '/user/login' || url === '/user/register') {
    await next()
  } else {
    const token = ctx.request.header.token
    try {
      jwt.verify(token, config.secret_key)
      await next()
    } catch (error) {
      ctx.body = {
        code: 401,
        message: 'Token error!'
      }
    }
  }
};

module.exports = checkToken