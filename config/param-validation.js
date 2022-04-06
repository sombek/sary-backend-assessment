import { Joi } from "express-validation";

const roles = [ "Admin", "Employee" ];

export default {
  // POST /api/users
  createUser: {
    body: Joi.object({
      name: Joi.string().required(),
      employeeType: Joi.any().valid(...roles),
      employeeNumber: Joi.string().length(4).pattern(/^[0-9]+$/).required()
        .messages({ "string.pattern.base": `"employeeNumber should be numbers only` }),
      password: Joi.string().length(6).required()
    })
  },

  createTable: {
    body: Joi.object({
      tableNumber: Joi.number().positive().required(),
      tableSeats: Joi.number().min(1).max(12).required()
    })
  },

  availableTimes: {
    params: Joi.object({
      numberOfCustomers: Joi.number().min(1).max(12).required()
    })
  },

  createReservation: {
    body: Joi.object({
      tableNumber: Joi.number().positive().required(),
      startingTime: Joi.string().regex(/\b((1[0-2]|0?[1-9]):([0-5][0-9])([AaPp][Mm]))/).required()
        .messages({ "string.pattern.base": "startingTime field fails to match the required pattern: 02:00PM" }),
      endingTime: Joi.string().regex(/\b((1[0-2]|0?[1-9]):([0-5][0-9])([AaPp][Mm]))/).required()
        .messages({ "string.pattern.base": "endingTime field fails to match the required pattern: 03:00PM" })
    })
  },

  getAllReservations: {
    query: Joi.object({
      order: Joi.number().required().valid("asc", "desc" ).label("order as url parameter"),
      page: Joi.number().required().label("page as url parameter"),
      size: Joi.number().positive().required().label("size as url parameter")
    })
  },

  // POST /api/auth/login
  login: {
    body: Joi.object({
      employeeNumber: Joi.string().required(),
      password: Joi.string().required()
    })
  }
};
