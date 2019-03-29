module.exports = {
    status: `SELECT
                    (SELECT COUNT(*) FROM forums ) AS forum,
                    (SELECT COUNT(*) FROM "users") AS "user",
                    (SELECT COUNT(*) FROM threads) AS thread,
                    (SELECT COUNT(*) FROM posts) AS post;`,
    clear: `TRUNCATE TABLE "users", forums, threads, posts, votes;`,
};