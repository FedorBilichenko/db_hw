const db = require('../../db');
const queryList = require('./queryList');

class UserModel {
    async create(data) {
        const query = {
            text: queryList.insertUser,
            values: [data.nickname, data.fullname, data.email, data.about],
            name: 'create_user',
        };
        const { error } = await db.sendQuery(query);

        return {error, data}
    }

    async getUserByNickEmail (data) {
        const query = {
            text: queryList.selectByNickOrEmail,
            values: [data.nickname, data.email],
            name: 'get_user_by_nick_or_email',
        };

        return await db.sendQuery(query);
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

        const query = {
            text: queryString,
        };

        return await db.sendQuery(query);
    }

    async update(data, nickname) {
        const selectors = Object.keys(data).map((key, idx, array) =>
            `${key}='${data[key]}' ${idx !== (array.length - 1) ? ', ' : ' '}`);
        const queryString = `UPDATE "users"
                            SET ${selectors.join('')}
                            WHERE nickname='${nickname}';`;

        const query = {
            text: queryString,
        };

        return await db.sendQuery(query);
    }
}

module.exports = new UserModel();