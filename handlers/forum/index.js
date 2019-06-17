const ForumModel = require('../../models/forum');
const ThreadModel = require('../../models/thread');
const CommonQueries = require('../../utils/commonQueries');

class ForumHandler {
    async create(req, res) {
        const {
            slug,
            user,
            title
        } = req.body;

        const { error=null, data: newForumResult }= await ForumModel.create({slug, user, title});
        if (error) {
            if (error.code === '23502') {
                res
                    .code(404)
                    .send({message: `Can't find user with nickname ${user}`});
                return;
            }
            if (error.code === '23505') {
                const { data: foundForum } = await ForumModel.get({slug});

                res
                    .code(409)
                    .send(foundForum[0]);
                return;
            }
        }

        res
            .code(201)
            .send(newForumResult[0])
    }

    async getDetails(req, res) {
        const { slug } = req.params;

        const { data: forumResult }= await ForumModel.get({slug});

        if (forumResult.length === 0) {
            res
                .code(404)
                .send({message: `Can't find forum with slug ${slug}`});
            return;
        }

        res
            .code(200)
            .send(forumResult[0])
    }

    async createThread(req, res) {
        const { error, data: newThreadResult } = await ThreadModel.create({
            ...req.body,
            ...{
                forum: req.params.slug,
            }
        });

        if (error) {
            if (error.code === '23502') {
                res
                    .code(404)
                    .send({message: `Can't find forum with slug ${req.params.slug}`});
                return;
            }

            if (error.code === '23503') {
                res
                    .code(404)
                    .send({message: `Can't find user`});
                return;
            }

            if (error.code === '23505') {
                const { data: foundThread } = await ThreadModel.get({data: {slug: req.body.slug}});

                res
                    .code(409)
                    .send(foundThread[0]);
                return;
            }
        }

        res
            .code(201)
            .send(newThreadResult[0]);
    }

    async getThreads(req, res) {
        const { slug: reqForumSLug } = req.params;

        const { data: curForumResult } = await ForumModel.get({slug: reqForumSLug});

        if (curForumResult.length === 0) {
            res
                .code(404)
                .send({message: `Can't find forum with slug ${reqForumSLug}`});
            return;
        }

        const { data: threadsResult } = await ThreadModel.get({
            data: {forum: reqForumSLug},
            sortData: req.query,
            operator: 'AND'
        });

        res
            .code(200)
            .send(threadsResult)
    }

    async getUsers(req, res) {
        const { slug: reqSLug } = req.params;

        const { data: curForumResult } = await ForumModel.get({slug: reqSLug});

        if (curForumResult.length === 0) {
            res
                .code(404)
                .send({message: `Can't find forum with slug ${reqSLug}`});
            return;
        }
        const { slug } = curForumResult[0];

        const { data: forumUsersResult }= await CommonQueries.getForumUsers({
            data: {
                forum: slug
            },
            sortData: req.query,
            operator: 'AND',
        });

        res
            .code(200)
            .send(forumUsersResult)

    }
}

module.exports = new ForumHandler();