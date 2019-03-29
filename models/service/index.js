const db = require('../../db');
const queryList = require('./queryList');


class ServiceModel {
    async status() {
        return await db.sendQuery(queryList.status);
    }

    async clear() {
        return await db.sendQuery(queryList.clear);
    }
}

module.exports = new ServiceModel();