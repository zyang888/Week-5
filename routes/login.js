const { Router } = require("express");
const router = Router();
const userDAO = require("../daos/login");
const { authFunc, isAdmin } = require("./authFunc");

// login
router.post("/", async (req, res, next) => {
  if (!req.body.password) {
    return res.status(400).send("Missing Password");
  }
  const token = await userDAO.login(req.body.email, req.body.password);
  if (!token) {
    return res.status(401).send("Login failed");
  }
  res.json({ token: token });
});

// set password
router.post("/password", authFunc, async (req, res, next) => {
  if (!req.body.password || req.body.password === "") {
    return res.status(400).send("Missing Password");
  }
  const success = await userDAO.password(req.user, req.body.password);
  res.sendStatus(success ? 200 : 400);
});

// signup
router.post("/signup", async (req, res, next) => {
  if (!req.body.password || !req.body.email) {
    return res.status(400).send("Missing Password or Email for signup");
  }
  const newUser = await userDAO.signup(req.body.email, req.body.password);
  if (newUser) {
    return res.send(newUser);
  }
  res.status(409).send("signup failed");
});

router.use((req, res, next) => {
  next({
    status: 404,
    message: "Not Found",
  });
});

module.exports = router;
