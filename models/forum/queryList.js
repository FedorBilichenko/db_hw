module.exports = {
  insertForum: `INSERT INTO forums (slug, title, "user")
                VALUES ($1,
                        $2,
                        (SELECT nickname FROM "users" WHERE nickname=$3 LIMIT 1)
                           ) RETURNING *;`,
};