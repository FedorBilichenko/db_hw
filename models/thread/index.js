const db = require('../../db');
const queryList = require('./queryList');


class ThreadModel {
    async create(data) {
        const values = [];
        db.UserForumSet.add(data.forum + data.author);
        const columns = Object.keys(data).map((key, idx, array) => {
            if (key === 'forum') {
                values.push(`(SELECT slug FROM forums WHERE slug = '${data[key]}')`);
            } else {
                values.push(`'${data[key]}'`);
            }
            return idx === (array.length - 1) ? `${key}` : `${key}, `
        });
        const queryString = `INSERT INTO threads (${columns.join('')})
                            VALUES (${values.join(', ')})
                            RETURNING *;`;
        const query = {
            text: queryString,
        };
        return await db.sendQuery(query);
    }

    async get({data, sortData={}, operator}) {

        const selectors = Object.keys(data).map((key, idx, array) =>
            `${key}='${data[key]}' ${idx !== (array.length - 1) ? `${operator} ` : ''}`);
        let descCondition = '', limitCondition='', sinceCondition='';

        if ('desc' in sortData) {
            descCondition = sortData.desc === 'true' ? 'DESC' : '';
        }

        if ('since' in sortData) {
            sinceCondition = `AND created${sortData.desc === 'true' ? '<=' : '>='}'${sortData.since}'`;
        }

        if ('limit' in sortData) {
            limitCondition = `LIMIT ${sortData.limit}`;
        }

        const queryString = `SELECT * FROM threads
                             WHERE ${selectors.join('')}
                             ${sinceCondition} ORDER BY created ${descCondition} ${limitCondition}`;

        const query = {
            text: queryString,
        };

        return await db.sendQuery(query);
    };

    async vote({slugOrId, voice}) {
        const query = {
            // name: 'vote_thread',
            text: Number.isInteger(Number(slugOrId))
                ? queryList.updateVoteById
                : queryList.updateVoteBySlug,
            values: [voice, slugOrId],
        };
        return await db.sendQuery(query);
    }

    async update(data, reqSlugOrId) {
        const selectors = Object.keys(data).map(key =>
            `${key}='${data[key]}'`
        );
        const queryString = `UPDATE threads
        SET ${selectors.join(', ')}
        WHERE ${Number.isInteger(Number(reqSlugOrId)) ? 'id' : 'slug'}='${reqSlugOrId}'
        RETURNING *;`;

        const query = {
            text: queryString,
        };

        return await db.sendQuery(query);
    }
}

module.exports = new ThreadModel();