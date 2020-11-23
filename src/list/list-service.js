const xss = require('xss');

const ListService = {
    getAllUserLists(db, user_id) {
        return db
            .from('anime_list')
            .select('*')
            .where('user_id', user_id)
    },

    getListById(db, list_id) {
        return db
            .from('anime_list')
            .select('*')
            .where('list_id', list_id)
    },

    getAnimeInList(db, list_id) {
        return db
            .from('list_anime')
            .select('*')
            .where('list_id', list_id)
    },

    getAnimeInfo(db, anime_id) {
        return db
            .from('anime')
            .select('*')
            .where('anime_id', anime_id)
    },

    getAllAnimeInfo(db, arr) {
        let result = [];
        const orig = [...arr];
        return new Promise((resolve, reject) => {
            orig.forEach(entry => {
                ListService.getAnimeInfo(db, entry.anime_id)
                    .then(info => {
                        if (!info) {
                            reject(`No info for anime with id ${entry.anime_id}`)
                        };
                        result.push(info[0]);
                        if (result.length === orig.length) {
                            resolve(result);
                        };
                    })
            })
        })
            .then(res => {
                return res;
            })
            .catch(error => {
                throw new Error(error)
            });
    },

    addList(db, info) {
        return db('anime_list')
            .insert(info)
            .returning('*')
            .then(res => res[0])
    },

    deleteList(db, list_id, user_id) {
        console.log(list_id)
        return new Promise((resolve, reject) => {
            ListService.getListById(db, list_id)
                .then(list => {
                    if (user_id != list[0].user_id) {
                        reject(`Mismatching user_id`)
                    } else {
                        ListService.deleteAllListAnime(db, list_id)
                            .then(() => {
                                ListService.deleteListAtId(db, list_id)
                                    .then(() => {
                                        resolve();
                                    })
                            })
                    }
                })
        })
        .then(res => {
            return res;
        })
        .catch(error => {
            throw new Error(error)
        });
    },

    deleteListAtId(db, list_id) {
        return db('anime_list')
            .where('list_id', list_id)
            .del();
    },

    deleteAllListAnime(db, list_id) {
        return db('list_anime')
            .where('list_id', list_id)
            .del();
    },

    updateList(db, id, patchItem) {

        return db('anime_list')
            .where('list_id', id)
            .update(patchItem)
            .returning('*')
            .then(item => item[0])
    },

    updateUserList(db, id, patchItem, user_id) {
        return new Promise((resolve, reject) => {
            ListService.getListById(db, id)
                .then(res => {
                    if (res[0].user_id === user_id) {
                        ListService.updateList(db, id, patchItem)
                            .then(item => {
                                resolve(item)
                            });
                    } else {
                        reject(`Mismatching user_id`)
                    };
                });
        })
            .then(updated => {
                return updated;
            })
            .catch();
    }
};

module.exports = ListService;