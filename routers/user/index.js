const handlers = require('../../handlers/user');

module.exports = [
    {method: 'post', url: '/user/:nickname/create', handler: handlers.create},
    {method: 'get', url: '/user/:nickname/profile', handler: handlers.get},
    {method: 'post', url: '/user/:nickname/profile', handler: handlers.update}
];

