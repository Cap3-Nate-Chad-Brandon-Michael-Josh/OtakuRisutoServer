const express = require('express');
const ListService = require('./list-service');
const jsonParser = express.json();

const ListRouter = express.Router();

ListRouter
    .route('/:id')
    .get(async (req, res, next) => {
        try {
            const list = await ListService.getListById(
                req.app.get('db'),
                req.params.id
            );
            list[0].list_anime = await ListService.getAnimeInList(
                req.app.get('db'),
                req.params.id
            );
            list[0].anime = await ListService.getAllAnimeInfo(
                req.app.get('db'),
                list[0].list_anime
            )

            if(list.length === 0){
                return res.status(400).json({
                    error: `Please send a proper list id`,
                })
            } else {
                res.status(200).json(list);
            }

            next();
        } catch (error) {
            next(error);
        };
    })
    .patch(jsonParser, (req, res, next) => {
        const patchItem = {
            name: req.body.name,
            private: req.body.private
        };
        const user_id = req.body.user_id;
        const id = req.params.id;
        ListService.updateUserList(
            req.app.get('db'),
            id,
            patchItem,
            user_id
        )
        .then(item => {
            res.status(200).json(item)
        })
        .catch(next)
    })

module.exports = ListRouter