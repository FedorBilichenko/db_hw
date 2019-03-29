const fastify = require('fastify')({
    logger: false,
});
const userRouter = require('./routers/user');
const forumRouter = require('./routers/forum');
const threadRouter = require('./routers/thread');
const postRouter = require('./routers/post');
const serviceRouter = require('./routers/service');

// const app = fastify();

fastify.addContentTypeParser('application/json', { parseAs: 'buffer' }, (req, body, done) => {
    if (body.length > 0) {
        done(null, JSON.parse(body));
    } else {
        done(null, {});
    }
});

const routers = [
    ...userRouter,
    ...forumRouter,
    ...threadRouter,
    ...postRouter,
    ...serviceRouter,
];

routers.forEach((router) => {
   const { method, url, handler } = router;
    fastify[method](`/api${url}`, handler);
});

fastify.listen(5000, '0.0.0.0');
console.log('Listening 5000...');
