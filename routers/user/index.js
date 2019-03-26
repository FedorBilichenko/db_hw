const handlers = require('../../handlers/user');

module.exports = [{method: 'post', url: '/user/:nickname/create', handler: handlers.create}];

