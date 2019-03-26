const User = require('../../models/user');

module.exports = {
    create: async (req, res) => {
        const { nickname } = req.params;
        const {
            email,
            fullname,
            about
        } = req.body;

        const curUsersResult = await User.select({nickname, email});

        if (curUsersResult.rowCount !== 0) {
            res
                .code(409)
                .send(curUsersResult.rows);
            return;
        }

        await User.create({
            nickname: nickname,
            email: email,
            fullname: fullname,
            about: about,
        });

        res
            .code(201)
            .send({
                nickname: nickname,
                email: email,
                fullname: fullname,
                about: about,
            });
    },
};