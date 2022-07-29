const HistoryModel = require('../models/history')

// history list
module.exports.list = async (ctx) => {
  try {
    const { dataset_id, page } = ctx.request.body
    const total = await HistoryModel.find({ dataset: dataset_id }).countDocuments()
    const histories = await HistoryModel
      .find({ dataset: dataset_id })
      .sort({ create_at: 1 })
      .skip((parseInt(page) - 1) * 10)
      .limit(10)
    ctx.body = {
      code: 200,
      data: histories,
      total
    }
  } catch (e) {
    ctx.body = {
      code: 500,
      message: 'Request error!'
    }
  }
}