module.exports = {
  updateVoteById: `INSERT INTO votes
              VALUES (
              $1, (
              SELECT id
              FROM threads
              WHERE id=$2
              LIMIT 1
              ), $3
              )
              ON CONFLICT ("user", thread)
              DO UPDATE SET vote=$4
              RETURNING *
      `,
  updateVoteBySlug: `INSERT INTO votes
            VALUES (
            $1, (
            SELECT id
            FROM threads
            WHERE slug=$2
            LIMIT 1
            ), $3
            )
            ON CONFLICT ("user", thread)
            DO UPDATE SET vote=$4
            RETURNING *
    `,
  selectVoteById: `SELECT * FROM votes
               WHERE "user"=$1
               AND thread=(
               SELECT id
               FROM threads
               WHERE id=$2
               LIMIT 1)`,
    selectVoteBySlug: `SELECT * FROM votes
               WHERE "user"=$1
               AND thread=(
               SELECT id
               FROM threads
               WHERE slug=$2
               LIMIT 1)`,
};