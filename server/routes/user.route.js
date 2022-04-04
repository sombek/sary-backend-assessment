import express from "express";
import { validate } from "express-validation";
import paramValidation from "../../config/param-validation";
import userCtrl from "../controllers/user.controller";
import expressJwt from "express-jwt";
import config from "../../config/config";
import APIError from "../helpers/APIError";
import httpStatus from "http-status";

const router = express.Router(); // eslint-disable-line new-cap


const ShouldBeAdmin = function(req, res, next) {
  if (req.user.employeeType !== "Admin")
    return next();
  return next(new APIError("You should be an admin to use this api", httpStatus.UNAUTHORIZED, true));
};

router.route("/")

  /** GET /api/users - Get list of users */
  .get(
    [
      expressJwt({ secret: config.jwtSecret, algorithms: [ "HS256" ] }),
      ShouldBeAdmin
    ]
    , userCtrl.list)

  /** POST /api/users - Create new user */
  .post([
    expressJwt({ secret: config.jwtSecret, algorithms: [ "HS256" ] }),
    ShouldBeAdmin,
    validate(paramValidation.createUser)
  ], userCtrl.create);

router.route("/:userId")

  /** GET /api/users/:userId - Get user */
  .get([
    expressJwt({ secret: config.jwtSecret, algorithms: [ "HS256" ] }),
    ShouldBeAdmin
  ], userCtrl.get)

  /** PUT /api/users/:userId - Update user */
  .put([
    expressJwt({ secret: config.jwtSecret, algorithms: [ "HS256" ] }),
    ShouldBeAdmin,
    validate(paramValidation.updateUser)
  ], userCtrl.update);

/** Load user when API with userId route parameter is hit */
router.param("userId", userCtrl.load);

export default router;
