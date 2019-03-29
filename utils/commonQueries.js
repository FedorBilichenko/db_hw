const db = require('../db');
const queryList = require('./queryList');


class CommonQueries {
    async selectUserForum({data}) {
        const { user, forum } = data;
        return await db.sendQuery(queryList.getUserForum, [user, forum])
    }

    async insertUserForum({data}) {
        const { user, forum } = data;
        return await db.sendQuery(queryList.insertUserForum, [user, forum])
    }

    async getForumUsers({data, sortData={}, operator}) {
        const selectors = Object.keys(data).map((key, idx, array) =>
            `${key}='${data[key]}' ${idx !== (array.length - 1) ? `${operator} ` : ''}`);
        let descCondition = '', limitCondition='', sinceCondition='';

        if ('desc' in sortData) {
            descCondition = sortData.desc === 'true' ? 'DESC' : '';
        }

        if ('since' in sortData) {
            sinceCondition = `AND nickname${sortData.desc === 'true' ? '<' : '>'}'${sortData.since}' COLLATE "C"`;
        }

        if ('limit' in sortData) {
            limitCondition = `LIMIT ${sortData.limit}`;
        }

        const queryString = `SELECT * FROM "users"
                             WHERE nickname IN (
                             SELECT "user" FROM users_forums
                             WHERE ${selectors.join('')})
                             ${sinceCondition} ORDER BY nickname COLLATE "C" ${descCondition} ${limitCondition}`;
        console.log(queryString);
        return await db.sendQuery(queryString);
    }
}

module.exports = new CommonQueries();
