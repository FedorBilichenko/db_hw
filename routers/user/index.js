const handlers = require('../../handlers/user');
const prefix = '/user';

module.exports = [
    {method: 'post', url: `${prefix}/:nickname/create`, handler: handlers.create},
    {method: 'get', url: `${prefix}/:nickname/profile`, handler: handlers.get},
    {method: 'post', url: `${prefix}/:nickname/profile`, handler: handlers.update}
];

