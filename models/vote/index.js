const db = require('../../db');
const queryList = require('./queryList');
const isNumber = require('isnumber-js');


class VoteModel {
    async addOrUpdate({user, slugOrId, voice}) {
        const query = {
            // name: 'update_vote',
            text: isNumber(slugOrId)
                ? queryList.updateVoteById
                : queryList.updateVoteBySlug,
            values: [user, slugOrId, voice, voice],
        };

        return await db.sendQuery(query);
    }

    async get({user, slugOrId}) {
        const query = {
            // name: 'get_vote',
            text: isNumber(slugOrId)
                ? queryList.selectVoteById
                : queryList.selectVoteBySlug,
            values: [user, slugOrId],
        };

        return await db.sendQuery(query);
    }
}

module.exports = new VoteModel();