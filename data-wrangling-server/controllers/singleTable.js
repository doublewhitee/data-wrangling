const mongoose = require('mongoose')

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

// combine rows
module.exports.combinerow = async (ctx) => {
  try {
    const { user_id, project_id, dataset_id, row } = ctx.request.body
    if (row.length <= 1) {
      ctx.body = {
        code: 501,
        message: 'More than one row should be selected!'
      }
    }
    const rows = await RowModel.find({ _id: { $in: row } })
    const updaterow = {}
    rows.map(r => {
      Object.keys(r.row).map(key => {
        if (key !== '_id') {
          if (!updaterow[key]) updaterow[key] = ''
          updaterow[key] += r.row[key]
        }
      })
    })
    const row_id = row.shift()
    await RowModel.findByIdAndUpdate(row_id, { row: updaterow, update_at: new Date() })
    await RowModel.deleteMany({ _id: { $in: row } })
    await DatasetModel.findByIdAndUpdate(dataset_id, { update_at: new Date() })
    await HistoryModel.create({
      project: project_id,
      user: user_id,
      dataset: dataset_id,
      type: 'Combine',
      action: 'Combine Row',
      comment: `${row.length} rows`
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

// combine columns
module.exports.combinecol = async (ctx) => {
  try {
    const { user_id, project_id, dataset_id, col_id, combineCol_id } = ctx.request.body
    await DatasetModel.findByIdAndUpdate(dataset_id, {
      $pull: { columns: { _id: combineCol_id } },
      update_at: new Date()
    })
    await RowModel.updateMany({ dataset: dataset_id }, [
      { $set: {
        [`row.${col_id}`]: {
          $concat: [
            { $ifNull:[ { $toString : `$row.${col_id}` } , ""] },
            { $ifNull:[ { $toString : `$row.${combineCol_id}` } , ""] },
            ]
          }
        }
      },
      { $unset: `row.${combineCol_id}` }
    ])
    await HistoryModel.create({
      project: project_id,
      user: user_id,
      dataset: dataset_id,
      type: 'Combine',
      action: 'Combine Column',
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

// separate columns
module.exports.splitcol = async (ctx) => {
  try {
    const { user_id, project_id, dataset_id, col_id, delimiter } = ctx.request.body
    const dataset = await DatasetModel.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(dataset_id) } },
      { $project: { 'columns': 1 } },
      { $lookup: { from: 'rows', localField: '_id', foreignField: 'dataset', as: 'rows' } },
    ])
    if (dataset.length !== 1) {
      ctx.body = {
        code: 501,
        message: 'Request dataset error!'
      }
    }
    const columns = dataset[0].columns
    let idx = 0
    const col = dataset[0].columns.find((c, index) => {
      if (c._id.toString() === col_id) {
        idx = index + 1
        return c
      }
    })
    const rowRes = []
    let size = 0
    dataset[0].rows.forEach(row => {
      const split = row.row[col_id].split(delimiter)
      size = Math.max(size, split.length)
      rowRes.push(split)
    })
    let tempSize = size
    while (tempSize > 0) {
      columns.splice(idx, 0, { name: `split_${tempSize}`, datatype: 'string' })
      tempSize -= 1
    }
    // create col
    const datasetUpdated = await DatasetModel.findByIdAndUpdate(dataset_id, { columns }, { new: true })
    // get new column _id
    const updateColumnId = []
    for (let i = idx; i < idx + size; i++) {
      updateColumnId.push(datasetUpdated.columns[i]._id)
    }
    // update rows
    dataset[0].rows.map(async (r, index) => {
      const temp = { ...r.row }
      updateColumnId.map(async (col, i) => {
        temp[col] = rowRes[index][i]
      })
      await RowModel.findByIdAndUpdate(r._id, { row: temp, update_at: new Date() })
    })
    
    await HistoryModel.create({
      project: project_id,
      user: user_id,
      dataset: dataset_id,
      type: 'Separate',
      action: 'Separate Column',
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