const ThreadModel = require('../../models/thread');
const PostModel = require('../../models/post');
const UserModel = require('../../models/user');
const ForumModel = require('../../models/forum');

class PostHandler {
    async getDetails(req, res) {
        const { id } = req.params;

        const curPostResult = await PostModel.get({id: id});

        if (curPostResult.rowCount === 0) {
            res
                .code(404)
                .send({message: `Can't find post with id ${id}`});
            return;
        }

        const { created, thread, author, forum } = curPostResult.rows[0];
        // curPostResult.rows[0].created = new Date(created.toString());

        const curThreadResult = await ThreadModel.get({
            data: {id: thread}
        });

        if (curThreadResult.rowCount === 0) {
            res
                .code(404)
                .send({message: `Can't find thread with id ${thread}`});
            return;
        }

        if (!('related' in req.query)) {
            res
                .code(200)
                .send({post: curPostResult.rows[0]});
            return;
        }
        const finalResult = {};

        const { related } = req.query;
        const arrRelated = related.split(',');

        if (!Array.isArray(arrRelated)) {
            if (arrRelated === 'user') {
                const curAuthorResult = await UserModel.getProfile({
                    data: {nickname: author}
                });
                finalResult['author'] = curAuthorResult.rows[0];
            }
            if (arrRelated === 'thread') {
                finalResult['thread'] = curThreadResult.rows[0];
            }
            if (arrRelated === 'forum') {
                const curForumResult = await ForumModel.get({slug: forum});
                finalResult['forum'] = curForumResult.rows[0];
            }
        } else {
            for (let i = 0; i < arrRelated.length; i++) {
                if (arrRelated[i] === 'user') {
                    const curAuthorResult = await UserModel.getProfile({
                        data: {nickname: author}
                    });
                    finalResult['author'] = curAuthorResult.rows[0];
                }
                if (arrRelated[i] === 'thread') {
                    finalResult['thread'] = curThreadResult.rows[0];
                }
                if (arrRelated[i] === 'forum') {
                    const curForumResult = await ForumModel.get({slug: forum});
                    finalResult['forum'] = curForumResult.rows[0];
                }
            }
        }

        finalResult.post = curPostResult.rows[0];

        res
            .code(200)
            .send(finalResult)
    }

    async edit(req, res) {
        const { id } = req.params;

        const curPostResult = await PostModel.get({id: id});

        if (curPostResult.rowCount === 0) {
            res
                .code(404)
                .send({message: `Can't find post with id ${id}`});
            return;
        }

        if (!('message' in req.body)) {
            res
                .code(200)
                .send(curPostResult.rows[0]);
            return;
        }

        const { created, message: curPostMessage } = curPostResult.rows[0];
        // curPostResult.rows[0].created = new Date(created.toString());
        const { message: reqPostMessage } = req.body;


        if (curPostMessage === reqPostMessage) {
            res
                .code(200)
                .send(curPostResult.rows[0]);
            return;
        }

        const updatePostResult = await PostModel.update({
            message: reqPostMessage,
            id: id,
        });

        const { created: updatedCreated } = updatePostResult.rows[0];
        // updatePostResult.rows[0].created = new Date(updatedCreated.toString());

        res
            .code(200)
            .send(updatePostResult.rows[0]);
    }
}

module.exports = new PostHandler();