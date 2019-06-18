const db = require('../../db');
const queryList = require('./queryList');

class PostModel {
    async createPosts({posts, forum, threadId}) {
        let queryValues = '';
        let userForumValues = '';
        let counter = 1;
        const values = [threadId];

        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];

            const parent = post.parent ? `(SELECT id FROM posts
            WHERE id = $${++counter}
                AND thread = (SELECT id FROM thread)
                LIMIT 1)` : `$${++counter}::integer`;

            queryValues += `(
                        (SELECT nextval('posts_id_seq')::integer),
                        ${parent},
                        (SELECT path FROM posts WHERE id = $${counter} LIMIT 1) ||
                        (SELECT currval('posts_id_seq')::integer),
                        $${++counter},
                        $${++counter},
                        (SELECT id FROM thread),
                        (SELECT forum FROM thread)), `;

            if (!db.UserForumSet.has(forum + post.author)) {
                userForumValues += `(
                    $${counter - 1},
                    (SELECT forum FROM thread)), `;
                db.UserForumSet.add(forum + post.author);
            }

            values.push(post.parent || 0, post.author, post.message);
        }

        queryValues = queryValues.slice(0, -2);
        userForumValues = userForumValues.slice(0, -2);
        const queryString = `
            WITH thread AS (
                SELECT id, forum
                FROM threads
                WHERE id = $1
                LIMIT 1
                ), increment_posts AS (
                UPDATE forums
                SET posts = posts + ${posts.length}
                WHERE slug = (SELECT forum from thread)
                )${userForumValues ? `, user_forum_into_user_forums AS (
                INSERT INTO users_forums ("user", forum)
                VALUES ${userForumValues}
                ON CONFLICT DO NOTHING
                )` : ''}
                INSERT INTO posts (${[
                    'id',
                    'parent',
                    'path',
                    'author',
                    'message',
                    'thread',
                    'forum',
                ].join(', ')})
                VALUES ${queryValues} RETURNING *;`;

        const query = {
            text: queryString,
            values,
        };

        return await db.sendQuery(query);
    }

    async get({id, related}) {
        const hasUser = !!related ? related.has('user') : false;
        const hasForum = !!related ? related.has('forum') : false;
        const hasThread = !!related ? related.has('thread') : false;

        const querySelect = related ? `posts.*
            ${hasUser ? ', "users".*' : ''}
            ${hasForum ? ', forums.*' : ''}
            ${hasThread ? `
                , threads.id AS "threadId"
                , threads.slug AS "threadSlug"
                , threads.author AS "threadAuthor"
                , threads.created AS "threadCreated"
                , threads.forum AS "threadForum"
                , threads.message AS "threadMessage"
                , threads.title AS "threadTitle"
                , threads.votes AS "threadVotes"
                ` : ''}
                ` : 'posts.*';

        const joins = related ? `
              ${hasUser ? 'LEFT JOIN "users" ON "users".nickname=posts.author' : ''}
              ${hasForum ? 'LEFT JOIN forums ON forums.slug=posts.forum' : ''}
              ${hasThread ? 'LEFT JOIN threads ON threads.id=posts.thread' : ''}
            ` : '';

        const queryString = `
          SELECT ${querySelect} FROM posts
          ${joins || ''}
          WHERE posts.id=${id} LIMIT 1`;

        const query = {
            text: queryString,
        };
        return await db.sendQuery(query);
    }

    async update({message, id}) {
        const query = {
            name: 'update_post',
            text: queryList.updatePost,
            values: [message, id]
        };

        return await db.sendQuery(query)
    }

}

module.exports = new PostModel();