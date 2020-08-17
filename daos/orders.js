const mongoose = require("mongoose");

const Order = require("../models/order");
const Item = require("../models/item");

module.exports = {};

module.exports.createOrder = async (userId, items) => {
  const itemArray = await Promise.all(
    items.map(async (x) => {
      return await Item.findOne({ _id: x }).lean();
    })
  );
  try {
    return await Order.create({
      userId: userId,
      items: items,
      total: itemArray.reduce((a, b) => a + b.price, 0),
    });
  } catch (e) {
    return;
  }
};

module.exports.getMyOrders = async (userId) => {
  try {
    return await Order.find({ userId: userId }).exec();
  } catch (e) {
    throw e;
  }
};

module.exports.getAll = async () => {
  try {
    return await Order.find().exec();
  } catch (e) {
    throw e;
  }
};

module.exports.getOrder = async (orderId) => {
  try {
    const temp = await Order.findOne({ _id: orderId }).lean();
    temp.items = await Promise.all(
      temp.items.map(async (x) => {
        return await Item.findOne({ _id: x }).lean();
      })
    );
    return temp;
  } catch (e) {
    throw e;
  }
};
