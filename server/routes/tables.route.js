import express from "express";
import { validate } from "express-validation";
import paramValidation from "../../config/param-validation";
import { ShouldBeAdmin } from "../helpers/RouteValidations";
import tablesController from "../controllers/tables.controller";
import expressJwt from "express-jwt";
import config from "../../config/config";

const router = express.Router();


router.route("/")
  .get(
    [
      expressJwt({ secret: config.jwtSecret, algorithms: [ "HS256" ] }),
      ShouldBeAdmin
    ], tablesController.list
  )
  .post([
    expressJwt({ secret: config.jwtSecret, algorithms: [ "HS256" ] }),
    ShouldBeAdmin,
    validate(paramValidation.createTable)
  ], tablesController.create);

router.route("/:tableNumber")
  .delete(
    [
      expressJwt({ secret: config.jwtSecret, algorithms: [ "HS256" ] }),
      ShouldBeAdmin,
    ], tablesController.deleteTable
  );


export default router;
