const searchService = {
  getUsers(db) {
    return db('users').select('*');
  },
  getLists(db) {
    return db('anime_list').select('*');
  },
  getOwner(db, user_id) {
    return db('users').select('*').where({ user_id }).first();
  },
  filterListsByName(lists, term) {
    let result = [];
    for (let i = 0; i < lists.length; i++) {
      if (lists[i].name.includes(term)) {
        result.push({
          list_id: lists[i].list_id,
          user_id: lists[i].user_id,
          name: lists[i].name,
          private: lists[i].private,
        });
      }
    }
    return result;
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
  getListRating(db, list_id) {
    return db('rating')
      .select('rating')
      .where({ list_id })
      .then((res) => {
        return this.calculateListRating(res);
      });
  },
  calculateListRating(ratingArr) {
    let sum = 0;

    for (let i = 0; i < ratingArr.length; i++) {
      sum = sum + ratingArr[i].rating;
    }
    let result = parseFloat((sum / ratingArr.length).toFixed(2));
    return result;
  },
  getUserRating(db, rating_user_id, list_id) {
    return db('rating')
      .select('rating')
      .where({ rating_user_id, list_id })
      .then(([rating]) => rating);
  },
};

module.exports = searchService;
