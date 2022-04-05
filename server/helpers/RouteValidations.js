import APIError from "../helpers/APIError";
import httpStatus from "http-status";
import { getRedisClient } from "../services/redis.service";

export const ShouldBeAdmin = async function(req, res, next) {
  const redisClient = await getRedisClient();
  const redisToken = await redisClient.get("session:" + req.user.tokenId);
  const user = JSON.parse(redisToken);

  if (user.employeeType === "Admin")
    return next();
  return next(new APIError("You should be an admin to use this api", httpStatus.UNAUTHORIZED, true));
};


export default {
  ShouldBeAdmin
};
