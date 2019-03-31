const db = require('../../db');
const queryList = require('./queryList');

class PostModel {
    async create(data) {
        const values = [];
        const columns = Object.keys(data).map((key, idx, array) => {
            if (key === 'path') {
                values.push(`'{${data[key]}}'::INT[]`);
            } else {
                values.push(`'${data[key]}'`);
            }
            return idx === (array.length - 1) ? `${key}` : `${key}, `
        });
        const queryString = `INSERT INTO posts (${columns.join('')})
                            VALUES (${values.join(', ')})
                            RETURNING *;`;

        return await db.sendQuery(queryString);
    }

    async get(data) {
        const selectors = Object.keys(data).map((key, idx, array) =>
            `${key}='${data[key]}' ${idx !== (array.length - 1) ? 'AND ' : ''}`);

        const queryString = `SELECT * FROM posts
                             WHERE ${selectors.join('')}`;

        return await db.sendQuery(queryString);
    }

    async update({message, id}) {
        return await db.sendQuery(queryList.updatePost, [message, id])
    }

}

module.exports = new PostModel();