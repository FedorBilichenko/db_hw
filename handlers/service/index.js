const ServiceModel = require('../../models/service');

class ServiceHandler {
    async getStatus(req, res) {
        const statusResult = await ServiceModel.status();
        const {
            forum,
            user,
            thread,
            post
        } = statusResult.rows[0];
        res
            .code(200)
            .send({
                forum: +forum,
                user: +user,
                thread: +thread,
                post: +post,
            });
    }

    async clear(req, res) {
        await ServiceModel.clear();
        res.code(200);
        res.send();
    }
}

module.exports = new ServiceHandler();