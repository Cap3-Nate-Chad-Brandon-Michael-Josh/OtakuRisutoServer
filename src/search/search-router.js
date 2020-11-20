const express = require("express");
const searchService = require("./seach-service");
const { requireAuth } = require("../middleware/JWT-auth");

const serachRouter = express.Router();
serachRouter.use(requireAuth);

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
serachRouter.get("/lists/:term", async (req, res, next) => {
  let term = req.params.term;
  let lists = await searchService.getLists(req.app.get("db"));
  let filteredList = searchService.filterListsByName(lists, term);
  let result = [];
  for (let i = 0; i < filteredList.length; i++) {
    if (!filteredList[i].private) {
      let dbOwner = await searchService.getOwner(
        req.app.get("db"),
        filteredList[i].user_id
      );
      result.push({
        list_id: filteredList[i].list_id,
        name: filteredList[i].name,
        owner: {
          username: dbOwner.username,
          user_id: dbOwner.user_id,
        },
      });
    }
  }
  if (result.length === 0) {
    return res
      .status(400)
      .json({ error: "Nothing found matching search criteria" });
  }
  res.json(result);
});
module.exports = serachRouter;
