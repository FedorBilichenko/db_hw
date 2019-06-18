const db = require('../db');
const queryList = require('./queryList');


class CommonQueries {
    async selectUserForum({data}) {
        const { user, forum } = data;
        const query = {
            text: queryList.getUserForum,
            values: [user, forum],
            name: 'get_user_forum'
        };

        return await db.sendQuery(query)
    }

    async insertUserForum({data}) {
        const { user, forum } = data;
        const query = {
            text: queryList.insertUserForum,
            values: [user, forum],
            name: 'insert_user_forum'
        };

        return await db.sendQuery(query)
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

        const query = {
            text: queryString,
        };

        return await db.sendQuery(query);
    }

    async getPostsThread({data, sortData={}}) {
        let sinceCondition='';
        const { slugOrId } = data;
        const { limit=100, desc=null, since=null, sort=null } = sortData;
        console.log(slugOrId, sortData);
        let queryString ='';
        switch (sort) {
            case 'tree': {
                if (since) {
                    sinceCondition = `
                    AND path ${desc === 'true' ? '<' : '>'} (
                      SELECT path FROM posts
                      WHERE id = '${since}'
                    )
                    `;
                }

                queryString = `
                    SELECT *
                    FROM posts
                    WHERE thread = (
                      SELECT id FROM threads
                      WHERE ${Number.isInteger(Number(slugOrId)) ? 'id' : 'slug'} = '${slugOrId}'
                      LIMIT 1
                    )
                    ${sinceCondition}
                    ORDER BY path ${desc === 'true' ? 'DESC' : 'ASC'}
                    LIMIT ${limit}
                  `;
                break;
            }
            case 'parent_tree': {
                if (since) {
                    if (desc === 'true') {
                        sinceCondition = `
                          AND path < (
                            SELECT path[1:1] FROM posts
                            WHERE id = '${since}'
                          )`;
                    } else {
                        sinceCondition = `
                        AND path > (
                            SELECT path FROM posts
                            WHERE id = '${since}'
                          )`;
                    }
                }

                queryString = `
                    WITH parents AS (
                      SELECT id FROM posts
                      WHERE thread = (
                        SELECT id FROM threads
                        WHERE ${Number.isInteger(Number(slugOrId)) ? 'id' : 'slug'} = '${slugOrId}'
                        LIMIT 1
                      )
                      AND parent = 0
                      ${sinceCondition}
                      ORDER BY id ${desc === 'true' ? 'DESC' : 'ASC'}
                      LIMIT ${limit}
                    )
                    SELECT * FROM posts
                    WHERE root IN (SELECT id FROM parents)
                    ORDER BY
                      root ${desc === 'true' ? 'DESC' : 'ASC'},
                      path ASC
                  `;
                break;
            }
            default: {
                if (since) {
                    sinceCondition = desc === 'true'
                        ? `AND id < '${since}'`
                        : `AND id > '${since}'`;
                }
                console.log('here', slugOrId, sort, limit);
                queryString = `
                    SELECT * FROM posts
                    WHERE thread = (
                      SELECT id FROM threads
                      WHERE ${Number.isInteger(Number(slugOrId)) ? 'id' : 'slug'} = '${slugOrId}'
                      LIMIT 1
                    )
                    ${sinceCondition}
                    ORDER BY
                      created ${desc === 'true' ? 'DESC' : 'ASC'},
                      id ${desc === 'true' ? 'DESC' : 'ASC'}
                    LIMIT ${limit}
                  `;
            }
        }

        console.log(queryString);

        const query = {
            text: queryString,
        };

        return await db.sendQuery(query);
    }
}

module.exports = new CommonQueries();
