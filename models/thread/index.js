const db = require('../../db');


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

        return await db.sendQuery(queryString);
    }

    async get(data, sortData) {
        console.log('data', data, 'sortData', sortData);

        const selectors = Object.keys(data).map((key, idx, array) =>
            `${key}='${data[key]}' ${idx !== (array.length - 1) ? 'AND ' : ''}`);
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

        console.log(queryString);

        return await db.sendQuery(queryString);
    }
}

module.exports = new ThreadModel();