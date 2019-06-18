const PostModel = require('../../models/post');

class PostHandler {
    async getDetails(req, res) {
        const { id } = req.params;
        const { related } = req.query;

        const relatedArray = related ? related.split(',') : null;

        const { data: foundPost = [] } = await PostModel.get({id, related: relatedArray});


        if (foundPost.length === 0) {
            res
                .code(404)
                .send({message: `Can't find post`});
            return;
        }

        const post = {
            id: foundPost[0].id,
            parent: foundPost[0].parent,
            root: foundPost[0].root,
            author: foundPost[0].author,
            message: foundPost[0].message,
            path: foundPost[0].path,
            isEdited: foundPost[0].isEdited,
            forum: foundPost[0].forum,
            thread: foundPost[0].thread,
            created: foundPost[0].created,
        };

        let author = null;
        if (related && related.includes('user')) {
            author = {
                nickname: foundPost[0].nickname,
                email: foundPost[0].email,
                fullname: foundPost[0].fullname,
                about: foundPost[0].about,
            };
        }

        let thread = null;
        if (related && related.includes('thread')) {
            thread = {
                id: foundPost[0].threadid,
                title: foundPost[0].threadtitle,
                author: foundPost[0].threadauthor,
                forum: foundPost[0].threadforum,
                message: foundPost[0].threadmessage,
                votes: foundPost[0].votes,
                slug: foundPost[0].threadslug,
                created: foundPost[0].threadcreated,
            };
        }

        let forum = null;
        if (related && related.includes('forum')) {
            forum = {
                title: foundPost[0].title,
                slug: foundPost[0].slug,
                user: foundPost[0].user,
                posts: foundPost[0].posts,
                threads: foundPost[0].threads,
            };
        }

        const result = { post };
        if (thread) result.thread = thread;
        if (author) result.author = author;
        if (forum) result.forum = forum;

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
                .send({message: `Can't find post`});
            return;
        }

        res
            .code(200)
            .send(updatePostResult[0]);
    }
}

module.exports = new PostHandler();