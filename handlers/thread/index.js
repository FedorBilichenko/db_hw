const isNumber = require('isnumber-js');
const PostsModel = require('../../models/post');
const ThreadModel = require('../../models/thread');


class ThreadHandler {
    async createPosts(req, res) {
        const { slug_or_id: reqSlugOrId } = req.params;
        const posts = req.body;
        const resultArrPosts = [];

        if (posts.length === 0) {
            res
                .code(201)
                .send([]);
            return;
        }

        let curThreadResult;
        if (isNumber(reqSlugOrId)) {
            curThreadResult = await ThreadModel.get({id: reqSlugOrId, slug: reqSlugOrId}, {}, 'OR');
        } else {
            curThreadResult = await ThreadModel.get({slug: reqSlugOrId});
        }

        if (curThreadResult.rowCount === 0) {
            res
                .code(404)
                .send({message: `Can't find thread with slug or id ${reqSlugOrId}`});
            return;
        }

        const {id: threadId, forum: forumSlug} = curThreadResult.rows[0];

        for (let i = 0; i < posts.length; i++) {
            let post = posts[i];
            if (('parent' in post) && (post.parent !== 0 )) {
                const parentResult = await PostsModel.get({id: parent});

                if (parentResult.rowCount === 0) {
                    res
                        .code(409)
                        .send({message: `Can't find parent post with id ${parent}`});
                    return;
                }
            }

            const curPostResult = await PostsModel.create({
                ...post,
                ...{
                    thread: threadId,
                    forum: forumSlug
                }
            });

            resultArrPosts.push(curPostResult.rows[0]);
        }

        res
            .code(201)
            .send(resultArrPosts)
    }
}

module.exports = new ThreadHandler();