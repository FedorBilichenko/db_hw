const db = require('../../db');
const queryList = require('./queryList');


class VoteModel {
    async create({user, thread, voice}) {
        return await db.sendQuery(queryList.insertVote, [user, thread, voice]);
    }

    async update({user, thread, voice}) {
        return await db.sendQuery(queryList.updateVote, [voice, user, thread]);
    }

    async get({user, thread}) {
        return await db.sendQuery(queryList.selectVote, [user, thread]);
    }
}

module.exports = new VoteModel();