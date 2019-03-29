const UserModel = require('../../models/user');

class UserHandler {
    async create(req, res) {
         const { nickname } = req.params;
         const {
             email,
             fullname,
             about
         } = req.body;

         const curUsersResult = await UserModel.getProfile({
             data: {nickname: nickname, email: email},
             operator: 'OR'
         });

         if (curUsersResult.rowCount !== 0) {
             res
                 .code(409)
                 .send(curUsersResult.rows);
             return;
         }

         await UserModel.create({
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
     }
    async get(req, res) {
        let { nickname } = req.params;

        const userProfileResult = await UserModel.getProfile({
            data: {nickname: nickname}
        });
        if (userProfileResult.rowCount === 0) {
            res
                .code(404)
                .send({message: `Can't fins user with nickname ${nickname}`});
            return;
        }

        const { nickname: userNickname, email, fullname, about } = userProfileResult.rows[0];

        res
            .code(200)
            .send({
                nickname: userNickname,
                email: email,
                fullname: fullname,
                about: about,
            })
    }
    async update(req, res) {
        const { nickname } = req.params;

        const curUserResult = await UserModel.getProfile({
            data: {nickname: nickname}
        });

        if (curUserResult.rowCount === 0) {
            res
                .code(404)
                .send({message: `Can't find user with nickname ${nickname}`});
            return;
        }

        if ('email' in req.body) {
            const { email } = req.body;
            const curEmailUser = await UserModel.getProfile({
                data: {email: email}
            });

            if ( curEmailUser.rowCount !== 0) {
                res
                    .code(409)
                    .send({message: `User with email ${email} is already signed up`});
                return;
            }
        }

        if (Object.keys(req.body).length === 0) {
            res
                .code(200)
                .send(curUserResult.rows[0]);
            return;
        }

        await UserModel.update(req.body, nickname);

        res
        .code(200)
        .send({
            ...curUserResult.rows[0],
            ...req.body
        })
    }
}

module.exports = new UserHandler();
