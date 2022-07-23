const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const cors = require('koa2-cors')
const mongoose = require('mongoose')
const config = require('config')

const router = require('./routes/index')
const checkToken = require("./utils/checkToken")

// mongoose
mongoose.connect(config.url, { useNewUrlParser: true, useUnifiedTopology: true })
const conn = mongoose.connection
conn.on('open', () => {
  console.log('db connect success!')
})

conn.on('error', error => {
  console.log('error: ' + error)
  mongoose.disconnect()
})

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// cors
app.use(cors())
// token middleware
app.use(checkToken)

// routes
router(app)

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
