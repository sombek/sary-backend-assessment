import jwt from "jsonwebtoken";
import httpStatus from "http-status";
import APIError from "../helpers/APIError";
import config from "../../config/config";
import db from "../../config/sequelize";
import bcrypt from "bcrypt";
import { getRedisClient } from "../services/redis.service";

const { User } = db;

// sample user, used for authentication
const user = {
  username: "react",
  password: "express"
};

/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function login(req, res, next) {
  User.findOne({ where: { employeeNumber: req.body.employeeNumber } })
    .then((user) => {
      if (!user)
        return next(new APIError("Password or Employee Number is not correct", httpStatus.UNAUTHORIZED, true));
      user = user.toJSON();
      bcrypt.compare(req.body.password, user.password)
        .then(async isPasswordTrue => {
          if (isPasswordTrue) {

            // var redisClient = await getRedisClient();
            // this will be stored in redis

            const token = jwt.sign({
              employeeNumber: user.employeeNumber,
              employeeType: user.employeeType,
              expiresIn: 3600
            }, config.jwtSecret);

            return res.json({
              token,
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
