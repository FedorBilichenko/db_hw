module.exports = {
    insertUser: `INSERT INTO users (nickname, fullname, email, about)
                 VALUES ($1, $2, $3, $4);`,
    selectByNickOrEmail: `SELECT * FROM users
                          WHERE nickname=$1 OR email=$2;`,
};