const isNumber = require('isnumber-js');
const PostsModel = require('../../models/post');
const ThreadModel = require('../../models/thread');
const ForumModel = require('../../models/forum');
const VoteModel = require('../../models/vote');
const UserModel = require('../../models/user');
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
        const { slug_or_id: reqSlugOrId } = req.params;
        const { nickname, voice } = req.body;

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

        if (curThreadResult.rowCount === 0) {
            res
                .code(404)
                .send({message: `Can't find thread with slug or id ${reqSlugOrId}`});
            return;
        }

        const curAuthorResult = await UserModel.getProfile({
            data: {nickname: nickname}
        });

        if (curAuthorResult.rowCount === 0) {
            res
                .code(404)
                .send({message: `Can't find user with nickname ${nickname}`});
            return;
        }

        const { id } = curThreadResult.rows[0];

        const curVoteResult = await VoteModel.get({user: nickname, thread: id});
        let resultVote = voice;

        if (curVoteResult.rowCount !== 0) {
            await VoteModel.update({user: nickname, voice: voice, thread: id});
            resultVote -= curVoteResult.rows[0].voice;
        } else {
            await VoteModel.create({user: nickname, voice: voice, thread: id});
        }

        const finalThread = await ThreadModel.vote({id: id, voice: resultVote});

        res
            .code(200)
            .send(finalThread.rows[0]);
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
            .send(curThreadResult[0])
    }

    async update(req, res) {
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

        if (curThreadResult.rowCount === 0) {
            res
                .code(404)
                .send({message: `Can't find thread with slug or id ${reqSlugOrId}`});
            return;
        }

        if (Object.keys(req.body).length === 0) {
            res
                .code(200)
                .send(curThreadResult.rows[0]);
            return;
        }

        const { id } = curThreadResult.rows[0];

        const updatedThreadResult = await ThreadModel.update(req.body, id);

        res
            .code(200)
            .send(updatedThreadResult.rows[0])

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

        if (curThreadResult.rowCount === 0) {
            res
                .code(404)
                .send({message: `Can't find thread with slug or id ${reqSlugOrId}`});
            return;
        }
        const { id: thread } = curThreadResult.rows[0];

        const postsResult = await CommonQueries.getPostsThread({
            data: {
                thread: thread
            },
            sortData: req.query,
        });

        res
            .code(200)
            .send(postsResult.rows)
    }
}

module.exports = new ThreadHandler();