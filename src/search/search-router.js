const express = require("express");
const searchService = require("./seach-service");
const requireAuth = require("../middleware/JWT-auth");

const serachRouter = express.Router();
//serachRouter.use(requireAuth)

serachRouter.get("/users/:term", async (req, res, next) => {
  let term = req.params.term;
  let users = await searchService.getUsers(req.app.get("db"));
  let result = searchService.filterUsersByName(users, term);
  if (result.length === 0) {
    return res
      .status(400)
      .json({ error: "Nothing found matching search criteria" });
  }
  res.json(result);
});

module.exports = serachRouter;
