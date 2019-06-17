module.exports = {
    selectByNickOrEmail: `SELECT * FROM threads
                          WHERE id=$1 OR slug=$2;`,
    updateVoteById: `UPDATE threads
                 SET votes=votes+$1
                 WHERE id=$2
                 RETURNING *;`,
    updateVoteBySlug: `UPDATE threads
                 SET votes=votes+$1
                 WHERE slug=$2
                 RETURNING *;`,

};