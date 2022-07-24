const mongoose = require('mongoose')

const Schema = mongoose.Schema

const projectSchema = new Schema({
  name: { type: String, required: true },
  desc: { type: String, default: '' },
  create_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
})

const Project = mongoose.model('Project', projectSchema)

module.exports = Project
