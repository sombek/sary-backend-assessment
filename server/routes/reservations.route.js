import express from "express";
import expressJwt from "express-jwt";
import config from "../../config/config";
import paramValidation from "../../config/param-validation";
import reservationsController from "../controllers/reservations.controller";
import { validate } from "express-validation";


const router = express.Router(); // eslint-disable-line new-cap


router.route("/")
  .post(
    [
      expressJwt({ secret: config.jwtSecret, algorithms: [ "HS256" ] }),
      validate(paramValidation.createReservation)
    ], reservationsController.create
  );

router.route("/available-times/:numberOfCustomers")
  .get(
    [
      expressJwt({ secret: config.jwtSecret, algorithms: [ "HS256" ] }),
      validate(paramValidation.availableTimes)
    ], reservationsController.list
  );




export default router;

