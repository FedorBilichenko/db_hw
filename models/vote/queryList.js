module.exports = {
  updateVote: `INSERT INTO votes
              VALUES (
              $1, (
              SELECT id
              FROM threads
              WHERE id=$2 OR slug=$2
              LIMIT 1
              ), $3
              )
              ON CONFLICT ("user", thread)
              DO UPDATE SET vote=$3
              RETURNING *
      `,
  selectVote: `SELECT * FROM votes
               WHERE "user"=$1
               AND thread=(
               SELECT id
               FROM threads
               WHERE id=$2 OR slug=$2
               LIMIT 1)`,
};