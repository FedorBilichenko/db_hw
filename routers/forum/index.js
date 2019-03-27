const handlers = require('../../handlers/forum');

const prefix = '/forum';

module.exports = [
    {method: 'post', url: `${prefix}/create`, handler: handlers.create},
];