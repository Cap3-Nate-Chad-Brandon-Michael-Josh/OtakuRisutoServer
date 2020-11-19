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
    async getAllAnimeInfo(db, arr) {
        let result = [];
        const orig = [...arr];
        let temp;
        // await orig.forEach(entry => {
        //     this.getAnimeInfo(db, entry.anime_id)
        //         .then((res) => {
        //             console.log(res)
        //             result.push(res[0])
        //         });
        // });
        orig.forEach(async function(entry){
            temp = await ListService.getAnimeInfo(db, entry.anime_id)
            console.log(temp)
                result.push(temp);
        })
        console.log('hi')
        return result;
    }
};

module.exports = ListService;