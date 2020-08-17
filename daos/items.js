const mongoose = require("mongoose");

const Item = require("../models/item");

module.exports = {};

module.exports.create = async (title, price) => {
  const count = await Item.countDocuments({ title: title });
  if (count > 0) return;
  try {
    return await Item.create({ title: title, price: price });
  } catch (e) {
    throw e;
  }
};

module.exports.getAll = async (userId) => {
  return await Item.find().lean();
};

module.exports.getItem = async (itemId) => {
  try {
    return await Item.findOne({ _id: itemId });
  } catch (e) {
      throw e;
  }
};

module.exports.updatePrice = async (itemId, price) => {
  try {
    await Item.updateOne({ _id: itemId }, { $set: { price: price } });
    return true;
  } catch (err) {
    return false;
  }
};
