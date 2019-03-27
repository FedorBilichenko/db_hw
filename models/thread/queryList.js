module.exports = {
    selectByNickOrEmail: `SELECT * FROM threads
                          WHERE id=$1 OR slug=$2;`,
};