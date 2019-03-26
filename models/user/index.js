const db = require('../../db');
const queryList = require('./queryList');

class User {
    async create(data) {
        const {
            nickname,
            fullname,
            email,
            about,
        } = data;

        return await db.sendQuery(queryList.insertUser, [nickname, fullname, email, about]);
    }

    async getProfiles({ nickname, email }) {
        return await db.sendQuery(queryList.selectByNickOrEmail, [nickname, email]);
    }

    async getProfile(data) {
        const selectors = Object.keys(data).map((key, idx, array) =>
            `${key}='${data[key]}' ${idx !== (array.length - 1) ? 'AND ' : ''}`);

        const queryString = `SELECT * FROM users
                             WHERE ${selectors.join('')}`;
        console.log(queryString);
        return await db.sendQuery(queryString, []);
    }

    async update(data, nickname) {
        const selectors = Object.keys(data).map((key, idx, array) =>
            `${key}='${data[key]}' ${idx !== (array.length - 1) ? ', ' : ' '}`);
        const queryString = `UPDATE users
                            SET ${selectors.join('')}
                            WHERE nickname='${nickname}';`;
        console.log(queryString);
        return await db.sendQuery(queryString, []);
    }
}

module.exports = new User();