const handlers = require('../../handlers/post');

const prefix = '/post';

module.exports = [
    {method: 'get', url: `${prefix}/:id/details`, handler: handlers.getDetails},
    {method: 'post', url: `${prefix}/:id/details`, handler: handlers.edit},
];