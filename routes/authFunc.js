const User = require("../models/user");
const jwt = require("jsonwebtoken");
const secret = "secret";

module.exports.authFunc = async (req, res, next) => {
  if (!req.header("Authorization")) {
    return res.status(401).send("Not authorized");
  }
  let token = req.header("Authorization").split("Bearer ")[1];
  try {
    const user = jwt.verify(token, secret);
    req.user = user;
    next();
  } catch (err) {
    res.status(401).send("Not authorized");
  }
};

module.exports.isAdmin = async (req, res, next) => {
  if (req.user.roles.includes("admin")) {
    next();
  } else {
    res.status(403).send("Not authorized");
  }
};
