const db = require('../../db');
const queryList = require('./queryList');

class ForumModel {
    async get(data) {
        const selectors = Object.keys(data).map((key, idx, array) =>
            `${key}='${data[key]}' ${idx !== (array.length - 1) ? 'AND ' : ''}`);

        const queryString = `SELECT * FROM forums
                             WHERE ${selectors.join('')}`;

        const query = {
            text: queryString
        };

        return await db.sendQuery(query);
    }

    async create(data) {
        const { slug, user, title } = data;
        const query = {
            text: queryList.insertForum,
            values: [slug, user, title],
            name: 'forum_create',
        };

        return await db.sendQuery(query);
    }

    async update(data, slug) {
        const selectors = Object.keys(data).map(key =>
            `${key}=${key}+${data[key]}`
        );
        const queryString = `UPDATE forums
        SET ${selectors.join(', ')}
        WHERE slug='${slug}'
        RETURNING *;`;

        const query = {
            text: queryString,
        };
        return await db.sendQuery(query);
    }

}

module.exports = new ForumModel();