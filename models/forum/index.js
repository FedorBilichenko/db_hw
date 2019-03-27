const db = require('../../db');
const queryList = require('./queryList');

class ForumModel {
    async get(data) {
        const selectors = Object.keys(data).map((key, idx, array) =>
            `${key}='${data[key]}' ${idx !== (array.length - 1) ? 'AND ' : ''}`);

        const queryString = `SELECT * FROM forums
                             WHERE ${selectors.join('')}`;

        return await db.sendQuery(queryString);
    }

    async create(data) {
        const { slug, user, title } = data;

        return await db.sendQuery(queryList.insertForum, [slug, user, title]);
    }

    async update(data, slug) {
        const selectors = Object.keys(data).map(key =>
            `${key}=${key}+${data[key]}`
        );
        const queryString = `UPDATE forums
        SET ${selectors.join(', ')}
        WHERE slug='${slug}'
        RETURNING *;`;

        return await db.sendQuery(queryString);
    }
}

module.exports = new ForumModel();