const PostModel = require('../../models/post');

class PostHandler {
    async getDetails(req, res) {
        const { id: postId } = req.params;
        const { related } = req.query;

        const relatedSet = !!related ? new Set(related.split(',')): null;
        const hasUser = !!relatedSet ? relatedSet.has('user') : false;
        const hasThread = !!relatedSet ? relatedSet.has('thread') : false;
        const hasForum = !!relatedSet ? relatedSet.has('forum') : false;


        const { data: foundPost = [] } = await PostModel.get({id: postId, related: relatedSet});

        if (foundPost.length === 0) {
            res
                .code(404)
                .send({message: `Can't find post with id ${postId}`});
            return;
        }
        const data = foundPost[0];
        const result = {
            post: {
                id: data.id,
                parent: data.parent,
                root: data.root,
                author: data.author,
                message: data.message,
                path: data.path,
                isEdited: data.isEdited,
                forum: data.forum,
                thread: data.thread,
                created: data.created,
            }
        };


        if (related) {
            if (hasUser)
            {
                result.author = {
                    nickname: data.nickname,
                    email: data.email,
                    fullname: data.fullname,
                    about: data.about,
                };
            }
            if (hasThread) {
                result.thread = {
                    id: data.threadId,
                    title: data.threadTitle,
                    author: data.threadAuthor,
                    forum: data.threadForum,
                    message: data.threadMessage,
                    votes: data.threadVotes,
                    slug: data.threadSlug,
                    created: data.threadCreated,
                };
            }

            if (hasForum) {
                result.forum = {
                    title: data.title,
                    slug: data.slug,
                    user: data.user,
                    posts: data.posts,
                    threads: data.threads,
                };
            }
        }


        res
            .code(200)
            .send(result);
    }

    async edit(req, res) {
        const { id } = req.params;
        const { message } = req.body;

        if (!('message' in req.body)) {
            const { data: curPostResult } = await PostModel.get({id});

            res
                .code(200)
                .send(curPostResult[0]);
            return;
        }

        const { data: updatePostResult } = await PostModel.update({
            message,
            id
        });

        if (updatePostResult.length === 0) {
            res
                .code(404)
                .send({message: `Can't find post with id ${id}`});
            return;
        }

        res
            .code(200)
            .send(updatePostResult[0]);
    }
}

module.exports = new PostHandler();