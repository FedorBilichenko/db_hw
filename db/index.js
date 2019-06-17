const { Pool } = require('pg');

class Db {
    constructor() {
        this.pool = new Pool({
            user: 'bilichenkofv',
            host: 'localhost',
            database: 'postgres',
            password: 'Klass575428',
            port: 5432,
        })
    }

    async sendQuery(query) {
        const client = await this.pool.connect();
        const response = {};

        try {
            const result = await client.query(query);
            response.data = result.rows;
        } catch (e) {
            response.error = e;
        } finally {
            client.release();
        }

        return response;
    }
}

module.exports = new Db();