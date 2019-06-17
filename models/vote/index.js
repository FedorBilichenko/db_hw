const db = require('../../db');
const queryList = require('./queryList');


class VoteModel {
    async addOrUpdate({user, slugOrId, voice}) {
        const query = {
            // name: 'update_vote',
            text: Number.isInteger(Number(slugOrId))
                ? queryList.updateVoteById
                : queryList.updateVoteBySlug,
            values: [user, slugOrId, voice, voice],
        };

        return await db.sendQuery(query);
    }

    async get({user, slugOrId}) {
        const query = {
            // name: 'get_vote',
            text: Number.isInteger(Number(slugOrId))
                ? queryList.selectVoteById
                : queryList.selectVoteBySlug,
            values: [user, slugOrId],
        };

        return await db.sendQuery(query);
    }
}

module.exports = new VoteModel();