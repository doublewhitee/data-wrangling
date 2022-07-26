const mongoose = require('mongoose')

const Schema = mongoose.Schema

const datasetSchema = new Schema({
  name: { type: String, required: true },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  create_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  columns: [{
    name: String,
    datatype: { type: String, enum: ['string', 'number'], default: 'string' }
  }],
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
})

const Dataset = mongoose.model('Dataset', datasetSchema)

module.exports = Dataset
