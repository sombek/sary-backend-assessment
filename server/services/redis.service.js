import { createClient } from "redis";
import config from "../../config/config";

module.exports.getRedisClient = async () => {
  const client = createClient({
    url: config.redisConnectionString
  });
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();
  return client;
};
