const { Pool } = require('pg');

class Db {
    constructor() {
        this.pool = new Pool({
            user: 'bilichenkofv',
            host: '127.0.0.1',
            database: 'technopark',
            password: 'Klass575428',
            port: 5432,
        })
    }

    async sendQuery(query, values) {
        const client = await this.pool.connect();
        const result = await client.query(query, values);

        client.release();
        return result;
    }
}

module.exports = new Db();