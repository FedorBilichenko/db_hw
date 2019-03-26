const fastify = require('fastify');

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

app.listen(5000);
console.log('Listening 5000...');

module.exports = app;

