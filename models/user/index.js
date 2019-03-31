const db = require('../../db');
const queryList = require('./queryList');

class UserModel {
    async create(data) {
        const {
            nickname,
            fullname,
            email,
            about,
        } = data;

        return await db.sendQuery(queryList.insertUser, [nickname, fullname, email, about]);
    }

    async getProfile({data, sortData={}, operator}) {
        const selectors = Object.keys(data).map((key, idx, array) =>
            `${key}='${data[key]}' ${idx !== (array.length - 1) ? `${operator} ` : ''}`);
        let descCondition = '', limitCondition='', sinceCondition='';

        if ('desc' in sortData) {
            descCondition = sortData.desc === 'true' ? 'DESC' : '';
        }

        if ('since' in sortData) {
            sinceCondition = `AND nickname${sortData.desc === 'true' ? '<' : '>'}'${sortData.since}'`;
        }

        if ('limit' in sortData) {
            limitCondition = `LIMIT ${sortData.limit}`;
        }

        const queryString = `SELECT * FROM "users"
                             WHERE ${selectors.join('')}
                             ${sinceCondition} ORDER BY nickname ${descCondition} ${limitCondition}`;
        // console.log((await db.sendQuery('SELECT * FROM pg_catalog.pg_tables;')).rows);
        console.log(queryString);
        return await db.sendQuery(queryString);
    }

    async update(data, nickname) {
        const selectors = Object.keys(data).map((key, idx, array) =>
            `${key}='${data[key]}' ${idx !== (array.length - 1) ? ', ' : ' '}`);
        const queryString = `UPDATE "users"
                            SET ${selectors.join('')}
                            WHERE nickname='${nickname}';`;

        return await db.sendQuery(queryString);
    }
}

module.exports = new UserModel();