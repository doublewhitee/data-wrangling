const mongoose = require('mongoose')

const Schema = mongoose.Schema

// actions
// 1. Create: create a new table

const historySchema = new Schema({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  dataset: { type: Schema.Types.ObjectId, ref: 'Dataset', required: true },
  action: { type: String, required: true },
  comment: { type: String },
  create_at: { type: Date, default: Date.now },
})

const History = mongoose.model('History', historySchema)

module.exports = History
