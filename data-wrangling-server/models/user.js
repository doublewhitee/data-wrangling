const mongoose = require('mongoose')
const md5 = require('blueimp-md5')

const Schema = mongoose.Schema

const userSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  create_at: { type: Date, default: Date.now }
})

const User = mongoose.model('User', userSchema)

// default user
User.findOne({ email: 'test@test.com' }).then(user => {
  if (!user) {
    User.create({
      email: 'test@test.com',
      first_name: 'test',
      last_name: 'test',
      password: md5('123456')
    })
    .then(() => {
      console.log('init account - email: test@test.com, password: 123456')
    })
  }
})

module.exports = User
