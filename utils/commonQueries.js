const isNumber = require('isnumber-js');
const db = require('../db');


class CommonQueries {
    async getForumUsers({data, sortData={}, operator}) {
        const selectors = Object.keys(data).map((key, idx, array) =>
            `${key}='${data[key]}' ${idx !== (array.length - 1) ? `${operator} ` : ''}`);

        let descCondition = '', limitCondition='', sinceCondition='';
        let desc = sortData.desc === 'true';

        if ('desc' in sortData) {
            descCondition = desc ? 'DESC' : '';
        }

        if ('since' in sortData) {
            sinceCondition = `AND nickname${desc ? '<' : '>'}'${sortData.since}' COLLATE "C"`;
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
        const { slugOrId } = data;
        const  { limit=100, since=null, sort=null } = sortData;
        let { desc='false' } = sortData;
        desc = desc === 'true';

        let sinceCondition='';
        const slugCondition  = `${isNumber(slugOrId) ? 'id' : 'slug'}='${slugOrId}'`;
        const descCondition = desc ? 'DESC' : 'ASC';

        let queryString ='';
        switch (sort) {
            case 'tree': {
                if (since) {
                    sinceCondition = `
                    AND path ${desc ? '<' : '>'} (SELECT path FROM posts WHERE id='${since}')`;
                }

                queryString = `
                    SELECT * FROM posts
                    WHERE thread=(
                      SELECT id FROM threads
                      WHERE ${slugCondition}
                      LIMIT 1
                    )
                    ${sinceCondition}
                    ORDER BY path ${descCondition}
                    LIMIT ${limit}
                  `;
                break;
            }
            case 'parent_tree': {
                if (since) {
                    if (desc) {
                        sinceCondition = `
                          AND path<(SELECT path[1:1] FROM posts WHERE id='${since}')`;
                    } else {
                        sinceCondition = `
                        AND path>(SELECT path FROM posts WHERE id='${since}')`;
                    }
                }

                queryString = `
                    WITH parents AS (
                      SELECT id FROM posts
                      WHERE thread=(SELECT id FROM threads WHERE ${slugCondition} LIMIT 1)
                      AND parent=0
                      ${sinceCondition}
                      ORDER BY id ${descCondition}
                      LIMIT ${limit}
                    )
                    SELECT * FROM posts
                    WHERE root IN (SELECT id FROM parents)
                    ORDER BY root ${descCondition}, path ASC `;
                break;
            }
            default: {
                if (since) {
                    sinceCondition = desc
                        ? `AND id<'${since}'`
                        : `AND id>'${since}'`;
                }
                queryString = `
                    SELECT * FROM posts
                    WHERE thread = (SELECT id FROM threads WHERE ${slugCondition} LIMIT 1)
                    ${sinceCondition}
                    ORDER BY created ${descCondition}, id ${descCondition} LIMIT ${limit}
                  `;
            }
        }

        const query = {
            text: queryString,
        };

        return await db.sendQuery(query);
    }
}

module.exports = new CommonQueries();
