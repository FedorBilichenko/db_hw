const db = require('../../db');
const queryList = require('./queryList');


class VoteModel {
    async addOrUpdate({user, slugOrId, voice}) {
        const query = {
            name: 'update_vote',
            text: queryList.updateVote,
            values: [user, slugOrId, voice],
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