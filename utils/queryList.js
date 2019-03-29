module.exports = {
    getUserForum: `SELECT *
                 FROM users_forums
                 WHERE "user"=$1 AND forum=$2;`,
    insertUserForum: `INSERT INTO users_forums ("user", forum)
                      VALUES ($1, $2);`,
};