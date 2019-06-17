const db = require('../../db');
const queryList = require('./queryList');


class VoteModel {
    async create({user, thread, voice}) {
        const query = {
            name: 'create_vote',
            text: queryList.insertVote,
            values: [user, thread, voice],
        };

        return await db.sendQuery(query);
    }

    async update({user, thread, voice}) {
        const query = {
            name: 'update_vote',
            text: queryList.updateVote,
            values: [voice, user, thread],
        };

        return await db.sendQuery(query);
    }

    async get({user, thread}) {
        const query = {
            name: 'get_vote',
            text: queryList.selectVote,
            values: [user, thread],
        };

        return await db.sendQuery(query);
    }
}

module.exports = new VoteModel();