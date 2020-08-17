const { Router } = require("express");
const router = Router();

const itemDAO = require("../daos/items");
const { authFunc, isAdmin } = require("./authFunc");

// create item
router.post("/", authFunc, isAdmin, async (req, res, next) => {
  if (!req.body.title || !req.body.price) {
    return res.status(400).send("Missing title or price");
  }
  const item = await itemDAO.create(req.body.title, req.body.price);
  if (!item) {
    return res.status(401).send("create item failed");
  }
  res.json(item);
});

// get all items
router.get("/", authFunc, async (req, res, next) => {
  res.json(await itemDAO.getAll());
});

// update price
router.put("/:id", authFunc, isAdmin, async (req, res, next) => {
  if (!req.body.price) {
    return res.status(400).send("Missing price");
  }
  const success = await itemDAO.updatePrice(req.params.id, req.body.price);
  res.sendStatus(success ? 200 : 400);
});

// get item
router.get("/:id", authFunc, async (req, res, next) => {
  res.json(await itemDAO.getItem(req.params.id));
});

module.exports = router;
