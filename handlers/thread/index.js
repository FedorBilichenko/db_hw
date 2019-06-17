const isNumber = require('isnumber-js');
const PostsModel = require('../../models/post');
const ThreadModel = require('../../models/thread');
const VoteModel = require('../../models/vote');
const CommonQueries = require('../../utils/commonQueries');


class ThreadHandler {
    async createPosts(req, res) {
        const { slug_or_id: reqSlugOrId } = req.params;
        const posts = req.body;

        let curThreadResult;
        if (isNumber(reqSlugOrId)) {
            curThreadResult = await ThreadModel.get({
                data: {id: reqSlugOrId, slug: reqSlugOrId},
                operator: 'OR',
            });
        } else {
            curThreadResult = await ThreadModel.get({
                data: {slug: reqSlugOrId}
            });
        }

        if (curThreadResult.data.length === 0) {
            res
                .code(404)
                .send({message: `Can't find thread with slug or id ${reqSlugOrId}`});
            return;
        }

        if (posts.length === 0) {
            res
                .code(201)
                .send([]);
            return;
        }

        const {id: threadId, forum: forumSlug} = curThreadResult.data[0];

        const { error, data: createdPosts } = await PostsModel.createPosts({posts, forum: forumSlug, threadId});

        if (error) {
            if (error.code === '23502') {
                res
                    .code(409)
                    .send({message: `Can't find parent`});
                return;
            }

            if (error.code === '23503') {
                res
                    .code(404)
                    .send({message: `Can't find profile`});
                return;
            }
        }

        res
            .code(201)
            .send(createdPosts)
    }

    async vote(req, res) {
        const { slug_or_id: slugOrId} = req.params;
        let { nickname, voice } = req.body;
        console.log('here');
        const { data: curVoteResult, error: error1 } = await VoteModel.get({user: nickname, slugOrId});
        console.log('here1');
        const { error } = await VoteModel.addOrUpdate({user: nickname, voice, slugOrId});
        console.log('here2');
        if (error) {
            if (error.code === '23502') {
                res
                    .code(404)
                    .send({message: `Can't find thread with id or slug ${slugOrId}`});
                return;
            }
            if (error.code === '23503') {
                res
                    .code(404)
                    .send({message: `Can't find user with nickname ${nickname}`});
                return;
            }
        }
        console.log('here3');
        console.log('finalThread error', error1);
        console.log('finalThread', curVoteResult);

        if (curVoteResult.length !== 0) {
            voice -= curVoteResult[0].vote;
        }
        console.log('here4');

        const { data: finalThread } = await ThreadModel.vote({slugOrId, voice});
        console.log('finalThread', finalThread[0]);
        console.log('here5');
        res
            .code(200)
            .send(finalThread[0]);
    }

    async getDetails(req, res) {
        const { slug_or_id: reqSlugOrId } = req.params;

        let curThreadResult;
        if (isNumber(reqSlugOrId)) {
            curThreadResult = await ThreadModel.get({
                data: {id: reqSlugOrId, slug: reqSlugOrId},
                operator: 'OR',
            });
        } else {
            curThreadResult = await ThreadModel.get({
                data: {slug: reqSlugOrId},
            });
        }

        if (curThreadResult.data.length === 0) {
            res
                .code(404)
                .send({message: `Can't find thread with slug or id ${reqSlugOrId}`});
            return;
        }

        res
            .code(200)
            .send(curThreadResult.data[0])
    }

    async update(req, res) {
        const { slug_or_id: reqSlugOrId } = req.params;

        if (Object.keys(req.body).length === 0) {
            let curThreadResult;
            if (isNumber(reqSlugOrId)) {
                curThreadResult = await ThreadModel.get({
                    data: {id: reqSlugOrId, slug: reqSlugOrId},
                    operator: 'OR',
                });
            } else {
                curThreadResult = await ThreadModel.get({
                    data: {slug: reqSlugOrId},
                });
            }

            if (curThreadResult.data.length === 0) {
                res
                    .code(404)
                    .send({message: `Can't find thread with slug or id ${reqSlugOrId}`});
                return;
            }

            res
                .code(200)
                .send(curThreadResult.data[0]);
            return;
        }

        const { data: updatedThreadResult } = await ThreadModel.update(req.body, reqSlugOrId);

        res
            .code(200)
            .send(updatedThreadResult[0])

    }

    async getPosts(req, res) {
        const { slug_or_id: reqSlugOrId} = req.params;

        let curThreadResult;
        if (isNumber(reqSlugOrId)) {
            curThreadResult = await ThreadModel.get({
                data: {id: reqSlugOrId, slug: reqSlugOrId},
                operator: 'OR',
            });
        } else {
            curThreadResult = await ThreadModel.get({
                data: {slug: reqSlugOrId}
            });
        }

        if (curThreadResult.data.length === 0) {
            res
                .code(404)
                .send({message: `Can't find thread with slug or id ${reqSlugOrId}`});
            return;
        }
        const { id: thread } = curThreadResult.data[0];

        const {data: postsResult}= await CommonQueries.getPostsThread({
            data: {
                thread: thread
            },
            sortData: req.query,
        });

        res
            .code(200)
            .send(postsResult)
    }
}

module.exports = new ThreadHandler();