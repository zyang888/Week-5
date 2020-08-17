const mongoose = require("mongoose");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const salt = 10;
const jwt = require("jsonwebtoken");
const secret = "secret";

module.exports = {};

module.exports.signup = async (email, password) => {
  const count = await User.countDocuments({ email: email });
  if (count > 0) return;
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = new User({
    email: email,
    password: hashedPassword,
    roles: ["user"],
  });
  return await User.create(newUser);
};

module.exports.login = async (email, password) => {
  const user = await User.findOne({ email: email });
  if (!user) return;
  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) return;
  return await jwt.sign({_id:user._id, email: email, roles: user.roles }, secret);
};

module.exports.password = async (user, password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, salt);
    await User.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );
    return true;
  } catch (err) {
    return false;
  }
};
