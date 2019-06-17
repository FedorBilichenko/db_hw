const db = require('../../db');
const queryList = require('./queryList');


class ServiceModel {
    async status() {
        const query = {
            text: queryList.status,
        };
        return await db.sendQuery(query);
    }

    async clear() {
        const query = {
            text: queryList.clear,
        };
        return await db.sendQuery(query);
    }
}

module.exports = new ServiceModel();