const searchService = {
  getUsers(db) {
    return db("users").select("*");
  },
  filterUsersByName(users, term) {
    let result = [];
    for (let i = 0; i < users.length; i++) {
      if (users[i].username.includes(term)) {
        result.push({ user_id: users[i].user_id, username: users[i].username });
      }
    }
    return result;
  },
};

module.exports = searchService;
