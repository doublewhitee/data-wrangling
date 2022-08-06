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
      return
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
      return
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
      return
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

// split table by columns
module.exports.splitbycol = async (ctx) => {
  try {
    const { user_id, project_id, dataset_id, cols } = ctx.request.body
    const info = await DatasetModel.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(dataset_id) } },
      { $lookup: { from: 'rows', localField: '_id', foreignField: 'dataset', as: 'rows' } },
      { $project: { rows: 1, name: 1, columns: 1 } },
    ])
    if (info.length !== 1) {
      ctx.body = {
        code: 501,
        message: 'Search dataset error!'
      }
      return
    }
    // get new columns and create new dataset
    const newCols = []
    cols.forEach(i => newCols.push({ name: i.name, datatype: i.datatype }))
    
    const dataset = await DatasetModel.create({
      name: 'Split by Columns',
      project: project_id,
      create_by: user_id,
      columns: newCols
    })
    // map cols
    const createdCols = dataset.columns
    const colMap = {}
    cols.forEach((i, idx) => { colMap[i._id] = createdCols[idx]._id.toString() })
    // rows
    const rows = []
    info[0].rows.forEach(row => {
      const temp = { dataset: dataset._id, project: project_id, row: {} }
      Object.keys(colMap).forEach(key => {
        temp.row[colMap[key]] = row.row[key]
      })
      rows.push(temp)
    })
    // insert row
    await RowModel.insertMany(rows)

    await HistoryModel.create({
      project: project_id,
      user: user_id,
      dataset: dataset._id,
      type: 'Separate',
      action: 'Split Table By Columns',
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

// split table by rows
module.exports.splitbyrow = async (ctx) => {
  try {
    const { user_id, project_id, dataset_id, col_id } = ctx.request.body
    const info = await DatasetModel.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(dataset_id) } },
      { $lookup: { from: 'rows', localField: '_id', foreignField: 'dataset', as: 'rows' } },
      { $unwind: '$rows' },
      { $project: { rows: 1, name: 1, columns: 1, target: `$rows.row.${col_id}` } },
      { $group: { _id: '$target', rows: { $push: '$rows.row' }, column: { $first: '$columns' } } }
    ])
    if (info.length === 0) {
      ctx.body = {
        code: 501,
        message: 'There is no data in the dataset!'
      }
      return
    } else if (info.length > 3) {
      ctx.body = {
        code: 501,
        message: 'A maximum of three classes are allowed!'
      }
      return
    }
    // get col info
    const col = info[0].column
    const createCol = []
    col.forEach(c => createCol.push({ name: c.name, datatype: c.datatype }))
    // create new datasets and add rows
    for (let i = 0; i < info.length; i++) {
      const dataset = await DatasetModel.create({
        name: `Split by Rows ${i + 1}`,
        project: project_id,
        create_by: user_id,
        columns: col
      })
      const oldCol = info[0].column
      const newCol = dataset.columns
      const colMap = {}
      oldCol.forEach((c, index) => colMap[c._id.toString()] = newCol[index]._id.toString())
      // get new rows
      const rows = info[i].rows
      const rowList = []
      rows.forEach(r => {
        const temp = { dataset: dataset._id, project: project_id, row: {} }
        Object.keys(r).forEach(key => {
          temp.row[colMap[key]] = r[key]
        })
        rowList.push(temp)
      })
      await RowModel.insertMany(rowList)
      // history
      await HistoryModel.create({
        project: project_id,
        user: user_id,
        dataset: dataset._id,
        type: 'Separate',
        action: 'Split Table By Rows',
      })
    }
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