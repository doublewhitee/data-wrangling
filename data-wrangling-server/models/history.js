const mongoose = require('mongoose')

const Schema = mongoose.Schema

// actions
// 1. Create Table: create a new table
// 2. Change Cell Value: edit cell
// 3. Change Column Name: rename column
// 4. Create Column: create a new column
// 5. Create Row: create a new row
// 6. Delete Column
// 7. Delete Row
// 8. Combine Row
// 9. Combine Column
// 10. Separate Column
// 11. Transform Row
// 12. Transform Column

const historySchema = new Schema({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  dataset: { type: Schema.Types.ObjectId, ref: 'Dataset', required: true },
  type: { type: String, enum: ['Create', 'Delete', 'Transform', 'Combine', 'Separate', 'Edit'], required: true },
  action: { type: String, required: true },
  comment: { type: String },
  create_at: { type: Date, default: Date.now },
})

const History = mongoose.model('History', historySchema)

module.exports = History
