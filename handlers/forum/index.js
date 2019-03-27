const ForumModel = require('../../models/forum');
const UserModel = require('../../models/user');
const ThreadModel = require('../../models/thread');

class ForumHandler {
    async create(req, res) {
        const {
            slug,
            user: reqUser,
            title
        } = req.body;

        const curUserResult = await UserModel.getProfile({nickname: reqUser});

        if (curUserResult.rowCount === 0) {
            res
                .code(404)
                .send({message: `Can't fins user with nickname ${reqUser}`});
            return;
        }

        const { nickname: user } = curUserResult.rows[0];

        const curForumResult = await ForumModel.get({slug: slug});

        if (curForumResult.rowCount !== 0) {

            res
                .code(409)
                .send(curForumResult.rows[0]);
            return;
        }

        const newForumResult = await ForumModel.create({slug: slug, user: user, title: title});

        res
            .code(201)
            .send(newForumResult.rows[0])
    }

    async getDetails(req, res) {
        const { slug } = req.params;

        const forumResult = await ForumModel.get({slug: slug});

        if (forumResult.rowCount === 0) {
            res
                .code(404)
                .send({message: `Can't find forum with slug ${slug}`});
            return;
        }

        res
            .code(200)
            .send(forumResult.rows[0])
    }

    async createThread(req, res) {
        const { slug: reqSlugForum } = req.params;
        const { author: reqAuthor } = req.body;

        const curAuthorResult = await UserModel.getProfile({nickname: reqAuthor});
        const curForumResult = await ForumModel.get({slug: reqSlugForum});

        if (curForumResult.rowCount === 0 || curAuthorResult.rowCount === 0) {
            res
                .code(404)
                .send({message: `Author or forum is not found`});
            return;
        }
        const inputData = {};

        if ('slug' in req.body) {
            inputData['slug'] = req.body.slug;
        }
        if ('id' in req.body) {
            inputData['id'] = req.body.id;
        }
        if (Object.keys(inputData).length !== 0) {
            const curThreadResult = await ThreadModel.get(inputData, {}, 'OR');

            if ( curThreadResult.rowCount !== 0) {
                res
                    .code(409)
                    .send(curThreadResult.rows[0]);
                return;
            }
        }

        const { slug: curSlugForum } = curForumResult.rows[0];
        const { nickname: curAuthor } = curAuthorResult.rows[0];

        const newThreadResult = await ThreadModel.create({
            ...req.body,
            ...{forum: curSlugForum, author: curAuthor}
        });

        res
            .code(201)
            .send(newThreadResult.rows[0]);
    }

    async getThreads(req, res) {
        const { slug: reqForumSLug } = req.params;

        const curForumResult = await ForumModel.get({slug: reqForumSLug});


        if (curForumResult.rowCount === 0) {
            res
                .code(404)
                .send({message: `Can't find forum with slug ${reqForumSLug}`});
            return;
        }

        const threadsResult = await ThreadModel.get({forum: reqForumSLug}, req.query, 'AND');

        res
            .code(200)
            .send(threadsResult.rows)
    }
}

module.exports = new ForumHandler();