const mongoose = require('mongoose')
const fs = require('fs')
const csv = require('csv-parser')
const xlsx = require('xlsx')

const DatasetModel = require('../models/dataset')
const RowModel = require('../models/row')
const HistoryModel = require('../models/history')
const ProjectModel = require('../models/project')

// create new dataset
module.exports.create = async (ctx) => {
  try {
    const { name, project_id, user_id } = ctx.request.body
    // create dataset
    const dataset = await DatasetModel.create({
      name,
      project: project_id,
      create_by: user_id,
      columns: [
        { name: 'Id', datatype: 'string' },
        { name: 'Item', datatype: 'string' },
        { name: 'Value', datatype: 'number' }
      ]
    })
    // add rows
    await RowModel.insertMany([
      {
        dataset: dataset._id,
        project: project_id,
        row: { Id: 'a', Item: 'A', Value: 10 }
      },
      {
        dataset: dataset._id,
        project: project_id,
        row: { Id: 'b', Item: 'B', Value: 20 }
      },
    ])
    // add history
    await HistoryModel.create({
      project: project_id,
      user: user_id,
      dataset: dataset._id,
      type: 'Create',
      action: 'Create Table',
    })
    // update project update time
    await ProjectModel.findByIdAndUpdate(project_id, { update_at: new Date() })
    ctx.body = {
      code: 200,
      data: dataset._id
    }
  } catch (e) {
    ctx.body = {
      code: 500,
      message: 'Request error!'
    }
  }
}

// import dataset
module.exports.import = async (ctx) => {
  try {
    const { file } = ctx.request.files
    const { project_id, user_id } = ctx.request.query
    let fileName = file.originalFilename.split('.')
    const format = fileName.pop().toLocaleLowerCase()
    fileName = fileName.join('')
    if (format !== 'csv' && format !== 'xlsx') {
      ctx.body = {
        code: 501,
        data: 'File format not supported!'
      }
    } else if (format === 'csv') {
      const reader = fs.createReadStream(file.filepath)
      const rows = []
      const cols = new Set()
      const columns = []
      reader.pipe(csv())
            .on('data', data => {
              Object.keys(data).map(i => {
                cols.add(i)
              })
              rows.push({ project: project_id, row: data })
            })
            .on('end', async () => {
              // get columns
              Array.from(cols.keys()).forEach(col => {
                columns.push({ name: col, datatype: 'string' })
              })
              // create dataset
              const dataset = await DatasetModel.create({
                name: fileName,
                project: project_id,
                create_by: user_id,
                columns
              })
              // create rows
              rows.forEach(row => row.dataset = dataset._id)
              await RowModel.insertMany(rows)
              // add history
              await HistoryModel.create({
                project: project_id,
                user: user_id,
                dataset: dataset._id,
                type: 'Create',
                action: 'Create Table',
              })
              // update project update time
              await ProjectModel.findByIdAndUpdate(project_id, { update_at: new Date() })
            })
    } else if (format === 'xlsx') {
      const workbook = xlsx.readFile(file.filepath)
      sheetNames = workbook.SheetNames
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[0]])
      const rows = []
      const cols = new Set()
      const columns = []
      data.forEach(row => {
        Object.keys(row).forEach(k => cols.add(k))
      })
      // get columns
      Array.from(cols.keys()).forEach(col => {
        columns.push({ name: col, datatype: 'string' })
      })
      // create dataset
      const dataset = await DatasetModel.create({
        name: fileName,
        project: project_id,
        create_by: user_id,
        columns
      })
      // create rows
      data.forEach(row => rows.push({ dataset: dataset._id, project: project_id, row }))
      await RowModel.insertMany(rows)
      // add history
      await HistoryModel.create({
        project: project_id,
        user: user_id,
        dataset: dataset._id,
        type: 'Create',
        action: 'Create Table',
      })
      // update project update time
      await ProjectModel.findByIdAndUpdate(project_id, { update_at: new Date() })
    }
    ctx.body = {
      code: 200,
      data: 'Import dataset successful!'
    }
  } catch (e) {
    ctx.body = {
      code: 500,
      message: 'Upload fail!'
    }
  }
}

// rename dataset
module.exports.edit = async (ctx) => {
  try {
    const { name, _id } = ctx.request.body
    const dataset = await DatasetModel.findByIdAndUpdate(_id, { name, update_at: new Date() })
    ctx.body = {
      code: 200,
      data: dataset._id
    }
  } catch (e) {
    ctx.body = {
      code: 500,
      message: 'Request error!'
    }
  }
}

// delete dataset
module.exports.delete = async (ctx) => {
  try {
    const { _id, project_id } = ctx.request.body
    await DatasetModel.findByIdAndDelete(_id)
    await RowModel.deleteMany({ dataset: _id })
    await HistoryModel.deleteMany({ dataset: _id })
    await ProjectModel.findByIdAndUpdate(project_id, { update_at: new Date() })
    ctx.body = {
      code: 200,
      data: 'Delete dataset successful!'
    }
  } catch (e) {
    ctx.body = {
      code: 500,
      message: 'Request error!'
    }
  }
}

// req dataset list
module.exports.list = async (ctx) => {
  try {
    const { project_id } = ctx.request.body
    const datasets = await DatasetModel.aggregate([
      { $match: { project: mongoose.Types.ObjectId(project_id) } },
      { $lookup: { from: 'users', localField: 'create_by', foreignField: '_id', as: 'user_info' } },
      { $project: { 'user_info.password': 0, 'user_info.create_at': 0, 'create_by': 0 } },
      { $unwind: '$user_info' },
      { $lookup: { from: 'rows', localField: '_id', foreignField: 'dataset', as: 'rows' } },
      { $project: { rows: { $size: '$rows' }, name: 1, user_info: 1, update_at: 1, create_at: 1, columns: 1 } },
      { $sort: { update_at: -1 } },
    ])
    ctx.body = {
      code: 200,
      data: datasets,
    }
  } catch (e) {
    ctx.body = {
      code: 500,
      message: 'Request error!'
    }
  }
}

// req dataset detail
module.exports.detail = async (ctx) => {
  try {
    const { _id } = ctx.request.body
    const datasets = await DatasetModel.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(_id) } },
      { $project: { 'name': 1, 'project': 1, 'columns': 1 } },
      { $lookup: {
        from: 'rows',
        let: { dataset_id: '$_id' },
        pipeline: [
          { $match: { '$expr': { '$eq': ['$dataset', '$$dataset_id'] } } },
          { $sort: { 'update_at': -1 } }
        ],
        as: 'rows'
      } },
      { $project: { 'rows.dataset': 0, 'rows.create_at': 0, 'rows.project': 0 } },
    ])
    if (datasets.length === 1) {
      ctx.body = {
        code: 200,
        data: datasets[0]
      }
    } else {
      ctx.body = {
        code: 501,
        message: 'Request dataset detail error!'
      }
    }
  } catch (e) {
    ctx.body = {
      code: 500,
      message: 'Request error!'
    }
  }
}