const { Router } = require("express");
const router = Router();

const orderDAO = require("../daos/orders");
const { authFunc, isAdmin } = require("./authFunc");

// create order
router.post("/", authFunc, async (req, res, next) => {
  if (!req.body) {
    return res.status(400).send("Missing item");
  }
  const order = await orderDAO.createOrder(req.user._id, req.body);
  if (!order) {
    return res.status(400).send("create order failed");
  }
  res.json(order);
});

// get my orders
router.get("/", authFunc, async (req, res, next) => {
  if (!req.user.roles.includes("admin")) {
    return res.json(await orderDAO.getMyOrders(req.user._id));
  } else {
    return res.json(await orderDAO.getAll());
  }
});

// get an order
router.get("/:id", authFunc, async (req, res, next) => {
  const temp = await orderDAO.getOrder(req.params.id);
  if (
    temp &&
    !req.user.roles.includes("admin") &&
    req.user._id.toString() !== temp.userId.toString()
  ) {
    return res.status(404).send("Cannot find order");
  }
  return res.json(temp);
});

module.exports = router;
