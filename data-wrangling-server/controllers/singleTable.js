const DatasetModel = require('../models/dataset')
const RowModel = require('../models/row')
const HistoryModel = require('../models/history')
const ProjectModel = require('../models/project')

// change cell value
module.exports.editcell = async (ctx) => {
  try {
    const { user_id, project_id, dataset_id, row_id, row } = ctx.request.body
    await RowModel.findByIdAndUpdate(row_id, { row, update_at: new Date() })
    await HistoryModel.create({
      project: project_id,
      user: user_id,
      dataset: dataset_id,
      type: 'Edit',
      action: 'Change Cell Value',
    })
    await DatasetModel.findByIdAndUpdate(dataset_id, { update_at: new Date() })
    await ProjectModel.findByIdAndUpdate(project_id, { update_at: new Date() })
    ctx.body = {
      code: 200,
      data: 'success!'
    }
  } catch (e) {
    ctx.body = {
      code: 500,
      message: 'Request error!'
    }
  }
}

// rename column
module.exports.renamecol = async (ctx) => {
  try {
    const { user_id, project_id, dataset_id, col_id, preName, name } = ctx.request.body
    const dataset = await DatasetModel.findById(dataset_id)
    const columns = dataset.columns
    columns.some(i => {
      if (i._id.toString() === col_id) {
        i.name = name
        return true
      }
    })
    await DatasetModel.findByIdAndUpdate(dataset_id, { columns, update_at: new Date() })
    await HistoryModel.create({
      project: project_id,
      user: user_id,
      dataset: dataset_id,
      type: 'Edit',
      action: 'Change Column Name',
      comment: `from "${preName}" to "${name}"`
    })
    await ProjectModel.findByIdAndUpdate(project_id, { update_at: new Date() })
    ctx.body = {
      code: 200,
      data: 'success!'
    }
  } catch (e) {
    ctx.body = {
      code: 500,
      message: 'Request error!'
    }
  }
}

// add column at left or right
module.exports.addcol = async (ctx) => {
  try {
    const { user_id, project_id, dataset_id, col_id, direction, name } = ctx.request.body
    const dataset = await DatasetModel.findById(dataset_id)
    const columns = dataset.columns
    let index = 0
    columns.some((i, idx) => {
      if (i._id.toString() === col_id) {
        index = idx
        return true
      }
    })
    if (direction === 'right') index += 1
    columns.splice(index, 0, { name, type: 'string' })
    await DatasetModel.findByIdAndUpdate(dataset_id, { columns, update_at: new Date() })
    await HistoryModel.create({
      project: project_id,
      user: user_id,
      dataset: dataset_id,
      type: 'Create',
      action: 'Create Column',
      comment: name
    })
    await ProjectModel.findByIdAndUpdate(project_id, { update_at: new Date() })
    ctx.body = {
      code: 200,
      data: 'success!'
    }
  } catch (e) {
    ctx.body = {
      code: 500,
      message: 'Request error!'
    }
  }
}

// add row
module.exports.addrow = async (ctx) => {
  try {
    const { user_id, project_id, dataset_id, row } = ctx.request.body
    await RowModel.create({
      dataset: dataset_id,
      project: project_id,
      row
    })
    await DatasetModel.findByIdAndUpdate(dataset_id, { update_at: new Date() })
    await HistoryModel.create({
      project: project_id,
      user: user_id,
      dataset: dataset_id,
      type: 'Create',
      action: 'Create Row',
    })
    await ProjectModel.findByIdAndUpdate(project_id, { update_at: new Date() })
    ctx.body = {
      code: 200,
      data: 'success!'
    }
  } catch (e) {
    ctx.body = {
      code: 500,
      message: 'Request error!'
    }
  }
}

// delete col
module.exports.deletecol = async (ctx) => {
  try {
    const { user_id, project_id, dataset_id, col_id, name } = ctx.request.body
    await DatasetModel.findByIdAndUpdate(dataset_id, {
      $pull: { columns: { _id: col_id } },
      update_at: new Date()
    })
    await RowModel.updateMany({ dataset: dataset_id }, {
      $unset: { [`row.${col_id}`]: 1 }
    })
    await HistoryModel.create({
      project: project_id,
      user: user_id,
      dataset: dataset_id,
      type: 'Delete',
      action: 'Delete Col',
      comment: name
    })
    await ProjectModel.findByIdAndUpdate(project_id, { update_at: new Date() })
    ctx.body = {
      code: 200,
      data: 'success!'
    }
  } catch (e) {
    console.log(e)
    ctx.body = {
      code: 500,
      message: 'Request error!'
    }
  }
}

// delete row
module.exports.deleterow = async (ctx) => {
  try {
    const { user_id, project_id, dataset_id, row } = ctx.request.body
    if (row.length === 0) {
      ctx.body = {
        code: 501,
        message: 'No row is selected!'
      }
    }
    await RowModel.deleteMany({ _id: { $in: row } })
    await DatasetModel.findByIdAndUpdate(dataset_id, { update_at: new Date() })
    await HistoryModel.create({
      project: project_id,
      user: user_id,
      dataset: dataset_id,
      type: 'Delete',
      action: 'Delete Row',
      comment: row.length === 1 ? '1 row' : `${row.length} rows`
    })
    await ProjectModel.findByIdAndUpdate(project_id, { update_at: new Date() })
    ctx.body = {
      code: 200,
      data: 'success!'
    }
  } catch (e) {
    ctx.body = {
      code: 500,
      message: 'Request error!'
    }
  }
}