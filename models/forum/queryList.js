module.exports = {
  insertForum: `INSERT INTO forums (slug, "user", title)
                VALUES ($1, $2, $3) RETURNING *;`,
};