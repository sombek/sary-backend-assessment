import APIError from "../helpers/APIError";
import httpStatus from "http-status";
import expressJwt from "express-jwt";
import config from "../../config/config";

export const ShouldBeAdmin = function(req, res, next) {
  if (req.user.employeeType === "Admin")
    return next();
  return next(new APIError("You should be an admin to use this api", httpStatus.UNAUTHORIZED, true));
};


export default {
  ShouldBeAdmin
};
