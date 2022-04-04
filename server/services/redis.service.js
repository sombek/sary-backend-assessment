import { createClient } from "redis";


module.exports.getRedisClient = async () => {
  const client = createClient({
    url: "redis://default:teQQIsp5tJVF2cDGtQlGWoe0qbYB75eU@redis-12900.c245.us-east-1-3.ec2.cloud.redislabs.com:12900"
  });
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();
  return client;
};
