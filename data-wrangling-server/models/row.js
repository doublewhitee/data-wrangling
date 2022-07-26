const mongoose = require('mongoose')

const Schema = mongoose.Schema

const rowSchema = new Schema({
  dataset: { type: Schema.Types.ObjectId, ref: 'Dataset', required: true },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  row: { type: Object },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
})

const Row = mongoose.model('Row', rowSchema)

module.exports = Row
