const handlers = require('../../handlers/thread');

const prefix = '/thread';

module.exports = [
    {method: 'post', url: `${prefix}/:slug_or_id/create`, handler: handlers.createPosts},
];