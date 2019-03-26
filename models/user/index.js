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

    async select({nickname, email}) {
        return await db.sendQuery(queryList.selectOne, [nickname, email]);
    }
}

module.exports = new User();