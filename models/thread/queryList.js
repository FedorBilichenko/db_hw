module.exports = {
    selectByNickOrEmail: `SELECT * FROM threads
                          WHERE id=$1 OR slug=$2;`,
    updateVote: `UPDATE threads
                 SET votes=votes+$1
                 WHERE id=$2
                 RETURNING *;`,

};