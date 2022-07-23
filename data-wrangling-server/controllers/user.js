const UserModel = require('../models/user')
const secret = require('../utils/secret')
const md5 = require('blueimp-md5')
const jwt = require('jsonwebtoken')
const config = require('config')

// register
module.exports.register = async (ctx) => {
  try {
    let { first_name, last_name, email, password } = ctx.request.body
    const user = await UserModel.findOne({ email })
    if (user) {
      ctx.body = {
        code: 501,
        message: 'This email address is already in use.'
      }
    } else {
      await UserModel.create({ first_name, last_name, email, password: md5(secret.decryptAES(password)) })
      ctx.body = {
        code: 200,
        data: email
      }
    }
  } catch (e) {
    ctx.body = {
      code: 500,
      message: 'Request error!'
    }
  }
}

// login
module.exports.login = async (ctx) => {
  try {
    const { email, password } = ctx.request.body
    const user = await UserModel.findOne({ email, password: md5(secret.decryptAES(password)) }, { password: 0, create_at: 0 })
    if (user) {
      // token
      const payload = {
        _id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
      const options = {
        expiresIn: '7d'
      }
      const token = jwt.sign(payload, config.secret_key, options)
      ctx.body = {
        code: 200,
        data: user,
        token
      }
    } else {
      ctx.body = {
        code: 501,
        message: 'Login failed.'
      }
    }
  } catch (e) {
    ctx.body = {
      code: 500,
      message: 'Request error!'
    }
  }
}

// get user info
module.exports.info = async (ctx) => {
  try {
    const token = ctx.request.header.token
    jwt.verify(token, config.secret_key, (err, decoded) => {
      ctx.body = {
        code: 200,
        data: decoded ? decoded : {},
      }
    })
  } catch (e) {
    ctx.body = {
      code: 500,
      message: 'Request error!'
    }
  }
}
