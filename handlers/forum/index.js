const ForumModel = require('../../models/forum');
const UserModel = require('../../models/user');

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

        const {
            slug: newSlug,
            user: newUser,
            title: newTitle,
            posts: newPosts,
            threads: newThreads,
        } = newForumResult.rows[0];

        res
            .code(201)
            .send({
                slug: newSlug,
                user: newUser,
                title: newTitle,
                posts: +newPosts,
                threads: newThreads
            })
    }
}

module.exports = new ForumHandler();