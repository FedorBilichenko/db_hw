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
        const resultArrPosts = [];

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

        if (posts.length === 0) {
            res
                .code(201)
                .send([]);
            return;
        }

        const {id: threadId, forum: forumSlug} = curThreadResult.rows[0];

        const sameTime = new Date().toISOString();

        for (let i = 0; i < posts.length; i++) {
            let post = posts[i];
            const { parent, author } = post;
            let path = [];

            if (('parent' in post) && (parent !== 0 )) {
                const parentResult = await PostsModel.get({id: parent, thread: threadId});

                if (parentResult.rowCount === 0) {
                    res
                        .code(409)
                        .send({message: `Can't find parent post with id ${parent} into thread with id ${threadId}`});
                    return;
                }
                path = parentResult.rows[0].path;
            }

            const curAuthorResult = await UserModel.getProfile({
                data: {nickname: author}
            });

            if ( curAuthorResult.rowCount === 0 ) {
                res
                    .code(404)
                    .send({message: `Can't find post author by nickname: ${author}`});
                return;
            }
            const { nickname } = curAuthorResult.rows[0];

/*            let curCreated;
            if (!('created' in post)) {
                curCreated = new Date().toISOString();
            } else {
                curCreated = post.created;
            }*/
            const nextId = await CommonQueries.getNextId();
            const { nextval: id } = nextId.rows[0];
            path.push(+id);

            const curPostResult = await PostsModel.create({
                ...post,
                ...{
                    id: id,
                    thread: threadId,
                    forum: forumSlug,
                    created: sameTime,
                    path: path,
                }
            });

            const curUserForumResult = await CommonQueries.selectUserForum({
                data: {
                    user: nickname,
                    forum: forumSlug
                }
            });
            if (curUserForumResult.rowCount === 0) {
                await CommonQueries.insertUserForum({
                    data: {
                        user: nickname,
                        forum: forumSlug
                    }
                })
            }
            /*const { created } = curPostResult.rows[0];
            curPostResult.rows[0].created = new Date(created);*/

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