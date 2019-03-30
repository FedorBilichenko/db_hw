module.exports = {
  insertVote: `INSERT INTO votes ("user", thread, voice)
               VALUES ($1, $2, $3)
               RETURNING *;`,
  updateVote: `UPDATE votes
               SET voice=$1
               WHERE "user"=$2 AND thread=$3;`,
  selectVote: `SELECT * FROM votes
               WHERE "user"=$1 AND thread=$2;`,
};