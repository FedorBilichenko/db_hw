const handlers = require('../../handlers/service');

const prefix = '/service';

module.exports = [
    {method: 'get', url: `${prefix}/status`, handler: handlers.getStatus},
    {method: 'post', url: `${prefix}/clear`, handler: handlers.clear},
];