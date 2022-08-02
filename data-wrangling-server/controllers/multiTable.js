const mongoose = require('mongoose')

const DatasetModel = require('../models/dataset')
const RowModel = require('../models/row')
const HistoryModel = require('../models/history')
const ProjectModel = require('../models/project')

// union
module.exports.union = async (ctx) => {
  try {
    const { user_id, project_id, left_dataset_id, right_dataset_id } = ctx.request.body
    const info = await DatasetModel.aggregate([
      { $match: { _id: { $in: [mongoose.Types.ObjectId(left_dataset_id), mongoose.Types.ObjectId(right_dataset_id)] } } },
      { $lookup: { from: 'rows', localField: '_id', foreignField: 'dataset', as: 'rows' } },
      { $project: { rows: 1, name: 1, columns: 1 } },
      { $sort: { update_at: -1 } },
    ])
    if (info.length !== 2) {
      ctx.body = {
        code: 501,
        message: 'Search dataset error!'
      }
    }
    const newCol = info[0].columns.map(col => ({ name: col.name, datatype: col.datatype }))
    // create new dataset
    const dataset = await DatasetModel.create({
      name: 'Union Result',
      project: project_id,
      create_by: user_id,
      columns: newCol
    })
    const colNameMap = {}
    dataset.columns.forEach(col => colNameMap[col.name] = col._id.toString())
    // col map
    const columnMap = new Map()
    info.forEach(i => {
      i.columns.forEach(col => {
        if (!columnMap.has(col._id.toString())) {
          columnMap.set(col._id.toString(), col.name)
        }
      })
    })
    // get rows
    const rowList = []
    info.forEach(i => {
      i.rows.forEach(r => {
        const temp = { dataset: dataset._id, project: project_id, row: {} }
        Object.keys(r.row).forEach(k => {
          temp.row[colNameMap[columnMap.get(k)]] = r.row[k]
        })
        rowList.push(temp)
      })
    })
    // insert row
    await RowModel.insertMany(rowList)
    
    await HistoryModel.create({
      project: project_id,
      user: user_id,
      dataset: dataset._id,
      type: 'Combine',
      action: 'Union',
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

// outer join
module.exports.outerjoin = async (ctx) => {
  try {
    const { user_id, project_id, left_dataset_id, right_dataset_id, left_col, right_col } = ctx.request.body
    const info = await DatasetModel.aggregate([
      { $match: { _id: { $in: [mongoose.Types.ObjectId(left_dataset_id), mongoose.Types.ObjectId(right_dataset_id)] } } },
      { $lookup: { from: 'rows', localField: '_id', foreignField: 'dataset', as: 'rows' } },
      { $project: { rows: 1, name: 1, columns: 1 } },
      { $sort: { update_at: -1 } },
    ])
    if (info.length !== 2) {
      ctx.body = {
        code: 501,
        message: 'Search dataset error!'
      }
    }
    // get left dataset and right dataset
    const leftDataset = info.find(i => i._id.toString() === left_dataset_id)
    const rightDataset = info.find(i => i._id.toString() === right_dataset_id)
    // get rows
    const rowList = []
    leftDataset.rows.forEach(left => {
      const leftVal = left.row[left_col]
      let hasRow = false
      rightDataset.rows.forEach(right => {
        if (leftVal === right.row[right_col]) {
          rowList.push({ row: { ...left.row, ...right.row } })
          hasRow = true
        }
      })
      if (!hasRow) rowList.push({ row: { ...left.row } })
    })
    if (rowList.length === 0) {
      ctx.body = {
        code: 502,
        message: 'Join result is empty!'
      }
    }
    const dataset = await DatasetModel.create({
      name: 'Outer Join Result',
      project: project_id,
      create_by: user_id,
      columns: [...leftDataset.columns, ...rightDataset.columns]
    })
    rowList.forEach(row => {
      row.dataset = dataset._id
      row.project = project_id
    })
    // insert row
    await RowModel.insertMany(rowList)

    await HistoryModel.create({
      project: project_id,
      user: user_id,
      dataset: dataset._id,
      type: 'Combine',
      action: 'Outer Join',
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

// inner join
module.exports.innerjoin = async (ctx) => {
  try {
    const { user_id, project_id, left_dataset_id, right_dataset_id, left_col, right_col } = ctx.request.body
    const info = await DatasetModel.aggregate([
      { $match: { _id: { $in: [mongoose.Types.ObjectId(left_dataset_id), mongoose.Types.ObjectId(right_dataset_id)] } } },
      { $lookup: { from: 'rows', localField: '_id', foreignField: 'dataset', as: 'rows' } },
      { $project: { rows: 1, name: 1, columns: 1 } },
      { $sort: { update_at: -1 } },
    ])
    if (info.length !== 2) {
      ctx.body = {
        code: 501,
        message: 'Search dataset error!'
      }
    }
    // get left dataset and right dataset
    const leftDataset = info.find(i => i._id.toString() === left_dataset_id)
    const rightDataset = info.find(i => i._id.toString() === right_dataset_id)
    // get rows
    const rowList = []
    leftDataset.rows.forEach(left => {
      const leftVal = left.row[left_col]
      rightDataset.rows.forEach(right => {
        if (leftVal === right.row[right_col]) {
          rowList.push({ row: { ...left.row, ...right.row } })
        }
      })
    })
    if (rowList.length === 0) {
      ctx.body = {
        code: 502,
        message: 'Join result is empty!'
      }
    }
    const dataset = await DatasetModel.create({
      name: 'Inner Join Result',
      project: project_id,
      create_by: user_id,
      columns: [...leftDataset.columns, ...rightDataset.columns]
    })
    rowList.forEach(row => {
      row.dataset = dataset._id
      row.project = project_id
    })
    // insert row
    await RowModel.insertMany(rowList)

    await HistoryModel.create({
      project: project_id,
      user: user_id,
      dataset: dataset._id,
      type: 'Combine',
      action: 'Inner Join',
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