const isNumber = require('isnumber-js');
const PostsModel = require('../../models/post');
const ThreadModel = require('../../models/thread');
const ForumModel = require('../../models/forum');
const VoteModel = require('../../models/vote');


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
            console.log(post);
            if (('parent' in post) && (post.parent !== 0 )) {
                const parentResult = await PostsModel.get({id: post.parent});

                if (parentResult.rowCount === 0) {
                    res
                        .code(409)
                        .send({message: `Can't find parent post with id ${post.parent}`});
                    return;
                }
            }


            const curPostResult = await PostsModel.create({
                ...post,
                ...{
                    thread: threadId,
                    forum: forumSlug,
                }
            });
            const { created } = curPostResult.rows[0];
            curPostResult.rows[0].created = new Date(created.toString());

            resultArrPosts.push({
                ...curPostResult.rows[0],
            });

        }

        await ForumModel.update({posts: posts.length}, forumSlug);

        res
            .code(201)
            .type('application/json')
            .send(resultArrPosts)
    }

    async vote(req, res) {
        const { slug_or_id: reqSlugOrId } = req.params;
        const { nickname, voice } = req.body;

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

        res
            .code(200)
            .send(curThreadResult.rows[0])
    }

    async update(req, res) {
        const { slug_or_id: reqSlugOrId } = req.params;

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

        const { id } = curThreadResult.rows[0];

        const updatedThreadResult = await ThreadModel.update(req.body, id);

        res
            .code(200)
            .send(updatedThreadResult.rows[0])

    }
}

module.exports = new ThreadHandler();