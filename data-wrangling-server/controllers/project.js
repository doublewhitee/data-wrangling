const mongoose = require('mongoose')

const ProjectModel = require('../models/project')
const DatasetModel = require('../models/dataset')
const RowModel = require('../models/row')
const HistoryModel = require('../models/history')

// create project
module.exports.create = async (ctx) => {
  try {
    const { name, desc, user_id } = ctx.request.body
    const project = await ProjectModel.create({
      name,
      desc,
      create_by: user_id
    })
    ctx.body = {
      code: 200,
      data: project
    }
  } catch (e) {
    ctx.body = {
      code: 500,
      message: 'Request error!'
    }
  }
}

// edit project
module.exports.edit = async (ctx) => {
  try {
    const { _id, name, desc } = ctx.request.body
    const project = await ProjectModel.findByIdAndUpdate(_id, { name, desc, update_at: new Date() })
    ctx.body = {
      code: 200,
      data: project
    }
  } catch (e) {
    ctx.body = {
      code: 500,
      message: 'Request error!'
    }
  }
}

// delete project
module.exports.delete = async (ctx) => {
  try {
    const { _id } = ctx.request.body
    const project = await ProjectModel.findByIdAndDelete(_id)
    await DatasetModel.deleteMany({ project: _id })
    await RowModel.deleteMany({ project: _id })
    await HistoryModel.deleteMany({ project: _id })
    ctx.body = {
      code: 200,
      data: project
    }
  } catch (e) {
    ctx.body = {
      code: 500,
      message: 'Request error!'
    }
  }
}

// req project list
module.exports.list = async (ctx) => {
  try {
    const { user_id, page, sort, search } = ctx.request.body
    const total = await ProjectModel.find({ create_by: user_id, name: { $regex: search } }).countDocuments()
    const projects = await ProjectModel.aggregate([
      { $match: { create_by: mongoose.Types.ObjectId(user_id), name: { $regex: search } } },
      { $lookup: { from: 'users', localField: 'create_by', foreignField: '_id', as: 'user_info' } },
      { $project: { 'user_info.password': 0, 'user_info.create_at': 0, 'create_by': 0 } },
      { $unwind: '$user_info' },
      { $lookup: { from: 'datasets', localField: '_id', foreignField: 'project', as: 'datasets' } },
      { $project: { contains: { $size: '$datasets' }, name: 1, user_info: 1, update_at: 1, desc: 1 } },
      { $sort: { [sort]: sort === 'name' ? 1 : -1 } },
      { $skip: (parseInt(page) - 1) * 5 },
      { $limit: 5 }
    ])
    ctx.body = {
      code: 200,
      data: projects,
      total
    }
  } catch (e) {
    ctx.body = {
      code: 500,
      message: 'Request error!'
    }
  }
}

// req project detail
module.exports.detail = async (ctx) => {
  try {
    const { _id } = ctx.request.body
    const project = await ProjectModel.findById(_id, { create_at: 0 }).populate('create_by', 'first_name last_name')
    if (!project) {
      ctx.body = {
        code: 501,
        message: 'Request project error!',
      }
    } else {
      ctx.body = {
        code: 200,
        data: project,
      }
    }
  } catch (e) {
    ctx.body = {
      code: 500,
      message: 'Request error!'
    }
  }
}