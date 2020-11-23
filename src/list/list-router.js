const express = require('express');
const animeService = require('../anime/anime-service');
const { requireAuth } = require('../middleware/JWT-auth');
const ListService = require('./list-service');
const jsonParser = express.json();

const ListRouter = express.Router();

ListRouter
    .route('/')
    // .all(requireAuth)
    .get(async (req, res, next) => {
        const { user_id } = req.body;
        if(!user_id){
            user_id = req.user.user_id;
        }
        const lists = await ListService.getAllUserLists(
            req.app.get('db'),
            user_id
        );
        res.status(200).json(lists);
    })
    .post(async (req, res, next) => {
        const { list_anime, name, private } = req.body;
        const user_id = req.user.user_id;
        const listObj = { user_id, name, private}
        await ListService.addList(
            req.app.get('db'),
            listObj
        )
        .then(async (res) => {
            await list_anime.forEach(async item => {
                const listAnime = {
                    list_id: res.list_id,
                    anime_id: item.anime_id
                }
                await animeService.addListAnime(
                    req.app.get('db'),
                    listAnime
                )
            })
        });
        res.status(201).send(`List successfully added`);
    })

ListRouter
    .route('/:id')
    .get(async (req, res, next) => {
        try {
            const list = await ListService.getListById(
                req.app.get('db'),
                req.params.id
            );
            if (!list){
                return res.status(400).json({
                    error: `List at given id not found`,
                })
            }
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
    .delete(async(req, res, next) => {
     console.log(req.body.list_id)
        await ListService.deleteList(
            req.app.get('db'),
            req.body.list_id
        );
        res.status(204).send(`List Deleted.`)
    })

module.exports = ListRouter