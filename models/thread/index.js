const db = require('../../db');
const queryList = require('./queryList');


class ThreadModel {
    async create(data) {
        const values = [];
        const columns = Object.keys(data).map((key, idx, array) => {
            values.push(`'${data[key]}'`);
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

    async vote({id, voice}) {
        const query = {
            name: 'vote_thread',
            text: queryList.updateVote,
            values: [voice, id],
        };
        return await db.sendQuery(query);
    }

    async update(data, id) {
        const selectors = Object.keys(data).map(key =>
            `${key}='${data[key]}'`
        );
        const queryString = `UPDATE threads
        SET ${selectors.join(', ')}
        WHERE id='${id}'
        RETURNING *;`;

        const query = {
            text: queryString,
        };

        return await db.sendQuery(query);
    }
}

module.exports = new ThreadModel();