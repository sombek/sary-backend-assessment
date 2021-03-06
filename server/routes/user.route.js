import express from "express";
import { validate } from "express-validation";
import paramValidation from "../../config/param-validation";
import userCtrl from "../controllers/user.controller";

import { ShouldBeAdmin } from "../helpers/RouteValidations";
import expressJwt from "express-jwt";
import config from "../../config/config";

const router = express.Router(); // eslint-disable-line new-cap


router.route("/")

  /** GET /api/users - Get list of users */
  .get(
    [
      expressJwt({ secret: config.jwtSecret, algorithms: [ "HS256" ] }),
      ShouldBeAdmin
    ], userCtrl.list)

  /** POST /api/users - Create new user */
  .post([
    expressJwt({ secret: config.jwtSecret, algorithms: [ "HS256" ] }),
    ShouldBeAdmin,
    validate(paramValidation.createUser)
  ], userCtrl.create);


/** Load user when API with userId route parameter is hit */
router.param("userId", userCtrl.load);

export default router;
