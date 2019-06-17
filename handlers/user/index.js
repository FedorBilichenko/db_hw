const UserModel = require('../../models/user');

class UserHandler {
    async create(req, res) {
         const { nickname } = req.params;
         const {
             email,
             fullname,
             about
         } = req.body;

         const { data: curUsersResult } = await UserModel.getUserByNickEmail({
             nickname,
             email
         });

         if (curUsersResult.length !== 0) {
             res
                 .code(409)
                 .send(curUsersResult);
             return;
         }

         const { data: createdUser } = await UserModel.create({
             nickname,
             email,
             fullname,
             about,
         });

         res
             .code(201)
             .send(createdUser);
    }

    async get(req, res) {
        let { nickname } = req.params;

        const { data: foundUser }= await UserModel.getProfile({
            data: {nickname}
        });
        if (foundUser.length === 0) {
            res
                .code(404)
                .send({message: `Can't find user with nickname ${nickname}`});
            return;
        }

        res
            .code(200)
            .send(foundUser[0])
    }
    async update(req, res) {
        const { nickname } = req.params;

        const { data: curUserResult } = await UserModel.getProfile({
            data: {nickname: nickname}
        });

        if (curUserResult.length === 0) {
            res
                .code(404)
                .send({message: `Can't find user with nickname ${nickname}`});
            return;
        }

        if ('email' in req.body) {
            const { email } = req.body;
            const { data: curEmailUser }= await UserModel.getProfile({
                data: {email: email}
            });

            if (curEmailUser.length !== 0) {
                res
                    .code(409)
                    .send({message: `User with email ${email} is already signed up`});
                return;
            }
        }

        if (Object.keys(req.body).length === 0) {
            res
                .code(200)
                .send(curUserResult[0]);
            return;
        }

        await UserModel.update(req.body, nickname);

        res
        .code(200)
        .send({
            ...curUserResult[0],
            ...req.body
        })
    }
}

module.exports = new UserHandler();
