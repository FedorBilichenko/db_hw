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

            const parent = post.parent ?
                `(SELECT id FROM posts
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
        const columns = [
            'id',
            'parent',
            'path',
            'author',
            'message',
            'thread',
            'forum',
        ];
        const queryString = `
            WITH thread AS (
                SELECT id, forum
                FROM threads
                WHERE id = $1
                LIMIT 1
                ), inc_posts AS (
                UPDATE forums
                SET posts = posts + ${posts.length}
                WHERE slug = (SELECT forum from thread)
                )${userForumValues ? `, ins_forum_users AS (
                INSERT INTO users_forums ("user", forum)
                VALUES ${userForumValues}
                ON CONFLICT DO NOTHING
                )` : ''}
                INSERT INTO posts (${columns.join(', ')})
                VALUES ${queryValues} RETURNING *;`;

        const query = {
            text: queryString,
            values,
        };

        return await db.sendQuery(query);
    }

    async get(data) {
        const selectors = Object.keys(data).map((key, idx, array) =>
            `${key}='${data[key]}' ${idx !== (array.length - 1) ? 'AND ' : ''}`);

        const queryString = `SELECT * FROM posts
                             WHERE ${selectors.join('')}`;
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