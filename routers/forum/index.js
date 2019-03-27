const handlers = require('../../handlers/forum');

const prefix = '/forum';

module.exports = [
    {method: 'post', url: `${prefix}/create`, handler: handlers.create},
    {method: 'get', url: `${prefix}/:slug/details`, handler: handlers.getDetails},
    {method: 'post', url: `${prefix}/:slug/create`, handler: handlers.createThread},
    {method: 'get', url: `${prefix}/:slug/threads`, handler: handlers.getThreads},
];