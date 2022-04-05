import jwt from "jsonwebtoken";
import httpStatus from "http-status";
import APIError from "../helpers/APIError";
import config from "../../config/config";
import db from "../../config/sequelize";
import bcrypt from "bcrypt";
import { getRedisClient } from "../services/redis.service";
import { v4 as uuidv4 } from "uuid";

const { User } = db;

function login(req, res, next) {
  User.findOne({ where: { employeeNumber: req.body.employeeNumber } })
    .then((user) => {
      if (!user)
        return next(new APIError("Password or Employee Number is not correct", httpStatus.UNAUTHORIZED, true));
      user = user.toJSON();

      // Check password
      bcrypt.compare(req.body.password, user.password)
        .then(async isPasswordTrue => {
          if (isPasswordTrue) {
            const redisClient = await getRedisClient();
            const tokenId = uuidv4();

            const jwtToken = jwt.sign({
              tokenId,
              expiresIn: config.jwtAge
            }, config.jwtSecret);

            const redisToken = {
              employeeNumber: user.employeeNumber,
              employeeType: user.employeeType
            };
            await redisClient.setEx("session:" + tokenId, config.jwtAge, JSON.stringify(redisToken));

            return res.json({
              jwtToken,
              username: user.username
            });
          }


          const err = new APIError("Password or Employee Number is not correct", httpStatus.UNAUTHORIZED, true);
          return next(err);
        });
    })
    .catch((e) => next(e));


}


export default { login };
