const handlers = require('../../handlers/thread');

const PREFIX = '/thread';

module.exports = [
    {method: 'post', url: `${PREFIX}/:slug_or_id/create`, handler: handlers.createPosts},
    {method: 'post', url: `${PREFIX}/:slug_or_id/vote`, handler: handlers.vote},
    {method: 'get', url: `${PREFIX}/:slug_or_id/details`, handler: handlers.getDetails},
    {method: 'post', url: `${PREFIX}/:slug_or_id/details`, handler: handlers.update},
    {method: 'get', url: `${PREFIX}/:slug_or_id/posts`, handler: handlers.getPosts},
];