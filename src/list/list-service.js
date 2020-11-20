const xss = require('xss');

const ListService = {
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
    }
};

module.exports = ListService;