const db = require('../db');
const queryList = require('./queryList');


class CommonQueries {
    async selectUserForum({data}) {
        const { user, forum } = data;
        return await db.sendQuery(queryList.getUserForum, [user, forum])
    }

    async insertUserForum({data}) {
        const { user, forum } = data;
        return await db.sendQuery(queryList.insertUserForum, [user, forum])
    }

    async getForumUsers({data, sortData={}, operator}) {
        const selectors = Object.keys(data).map((key, idx, array) =>
            `${key}='${data[key]}' ${idx !== (array.length - 1) ? `${operator} ` : ''}`);
        let descCondition = '', limitCondition='', sinceCondition='';

        if ('desc' in sortData) {
            descCondition = sortData.desc === 'true' ? 'DESC' : '';
        }

        if ('since' in sortData) {
            sinceCondition = `AND nickname${sortData.desc === 'true' ? '<' : '>'}'${sortData.since}' COLLATE "C"`;
        }

        if ('limit' in sortData) {
            limitCondition = `LIMIT ${sortData.limit}`;
        }

        const queryString = `SELECT * FROM "users"
                             WHERE nickname IN (
                             SELECT "user" FROM users_forums
                             WHERE ${selectors.join('')})
                             ${sinceCondition} ORDER BY nickname COLLATE "C" ${descCondition} ${limitCondition}`;
        return await db.sendQuery(queryString);
    }

    async getNextId() {
        return await db.sendQuery(queryList.selectNextIds)
    }

    async getPostsThread({data, sortData={}}) {
        let sortTypeCondition='',
            sinceCondition='',
            descCondition='',
            limitCondition='';
        const { thread } = data;

        const { sort } = sortData;
        let queryString = `
            SELECT P.*
            FROM posts P
        `;
        const values = [];
        values.push(thread);
        switch (sort) {
            case 'tree': {
                if ('since' in sortData) {
                    if ('desc' in sortData && sortData.desc === 'true') {
                        sinceCondition =  `JOIN posts P1 ON P1.id = $2
                                            WHERE P.thread=$1 AND P.path<P1.path`;
                    } else {
                        sinceCondition =  `JOIN posts P1 ON P1.id = $2
                                            WHERE P.thread=$1 AND P.path>P1.path`;
                    }
                    values.push(sortData.since);
                } else {
                    sinceCondition = `WHERE P.thread=$1`;
                }

                if ('desc' in sortData && sortData.desc === 'true') {
                    descCondition = `ORDER BY P.path DESC`;
                } else {
                    descCondition = `ORDER BY P.path`;
                }

                if ('limit' in sortData) {
                    if ('since' in sortData) {
                        limitCondition = `LIMIT $3`;
                    } else {
                        limitCondition = `LIMIT $2`;
                    }
                    values.push(sortData.limit)
                }
                sortTypeCondition = ` ${sinceCondition} ${descCondition} ${limitCondition}`;
                break;
            }
            case 'parent_tree': {
                if ('since' in sortData) {
                    if ('desc' in sortData && sortData.desc === 'true') {
                        sinceCondition = `JOIN posts P2 ON P2.id = $2
                                            WHERE P1.thread = $1 AND P1.parent = 0 AND P1.id < P2.path[1]`;
                    } else {
                        sinceCondition = `JOIN posts P2 ON P2.id = $2
                                            WHERE P1.thread = $1 AND P1.parent = 0 AND P1.id > P2.path[1]`;
                    }
                    values.push(sortData.since);
                } else {
                    sinceCondition = `WHERE P1.thread = $1 AND P1.parent = 0`;
                }
                if ('desc' in sortData && sortData.desc === 'true') {
                    descCondition = `ORDER BY P1.id DESC`;
                } else {
                    descCondition = `ORDER BY P1.id`;
                }
                if ('limit' in sortData) {
                    if ('since' in sortData) {
                        limitCondition += `LIMIT $3`;
                    } else {
                        limitCondition += `LIMIT $2`;
                    }
                    values.push(sortData.limit);
                }
                sortTypeCondition = ` WHERE P.path[1] IN
                (SELECT P1.id FROM posts P1
                ${sinceCondition} 
                ${descCondition}
                ${limitCondition}
                ${'desc' in sortData && sortData.desc === 'true' ? `) ORDER BY P.path[1] DESC, path` : `) ORDER BY P.path`}`;
                break;
            }
            default: {
                if ('since' in sortData) {
                    if ('desc' in sortData && sortData.desc === 'true') {
                        sinceCondition = `AND P.id < $2`;
                    } else {
                        sinceCondition = `AND P.id > $2`;
                    }
                    values.push(sortData.since);
                }
                if ('desc' in sortData && sortData.desc === 'true') {
                    descCondition = `ORDER BY P.id DESC`;
                } else {
                    descCondition = `ORDER BY P.id ASC`;
                }
                if ('limit' in sortData) {
                    if ('since' in sortData) {
                        limitCondition += `LIMIT $3`;
                    } else {
                        limitCondition += `LIMIT $2`;
                    }
                    values.push(sortData.limit);
                }
                sortTypeCondition =` WHERE P.thread = $1 ${sinceCondition} ${descCondition} ${limitCondition}`;
            }
        }
        queryString += sortTypeCondition;
        return await db.sendQuery(queryString, values);
    }
}

module.exports = new CommonQueries();
