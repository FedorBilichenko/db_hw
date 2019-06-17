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

        const query = {
            text: queryString,
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