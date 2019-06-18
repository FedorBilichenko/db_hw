module.exports = {
  updatePost: `UPDATE posts 
               SET message=$1
               WHERE id=$2
               RETURNING *;`
};