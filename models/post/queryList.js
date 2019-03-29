module.exports = {
  updatePost: `UPDATE posts
               SET message=$1, "isEdited"=TRUE
               WHERE id=$2
               RETURNING *;`
};