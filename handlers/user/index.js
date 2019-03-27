const User = require('../../models/user');

module.exports = {
    create: async (req, res) => {
        const { nickname } = req.params;
        const {
            email,
            fullname,
            about
        } = req.body;

        const curUsersResult = await User.getProfiles({nickname: nickname, email: email});

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
    get: async (req, res) => {
      let { nickname } = req.params;

      const userProfileResult = await User.getProfile({nickname: nickname});

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
    },
    update: async (req, res) => {
        const { nickname } = req.params;

        const curUserResult = await User.getProfile({nickname: nickname });

        if (curUserResult.rowCount === 0) {
            res
                .code(404)
                .send({message: `Can't find user with nickname ${nickname}`});
            return;
        }

        if ('email' in req.body) {
            const { email } = req.body;
            const curEmailUser = await User.getProfile({email: email});

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

        await User.update(req.body, nickname);

        res
            .code(200)
            .send({
                ...curUserResult.rows[0],
                ...req.body
            })
    }
};