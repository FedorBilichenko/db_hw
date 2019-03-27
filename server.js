const fastify = require('fastify');
const userRouter = require('./routers/user');
const forumRouter = require('./routers/forum');

const app = fastify();

app.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
    try {
        const json = JSON.parse(body);
        done(null, json);
    } catch (err) {
        err.statusCode = 400;
        done(err, undefined)
    }
});

const routers = [...userRouter, ...forumRouter];

routers.forEach((router) => {
   const { method, url, handler } = router;
    app[method](`/api${url}`, handler);
});

app.listen(5000, '0.0.0.0');
console.log('Listening 5000...');
