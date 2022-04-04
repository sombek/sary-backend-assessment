import { Joi } from "express-validation";

let roles = [ "Admin", "Employee" ];
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
      tableSeats: Joi.number().positive().required()
    })
  },
  deleteTable: {
    body: Joi.object({
      tableNumber: Joi.number().positive().required()
    })
  },

  // UPDATE /api/users/:userId
  updateUser: {
    body: Joi.object({
      id: Joi.number().integer(),
      name: Joi.string().required(),
      updatedAt: Joi.string(),
      createdAt: Joi.string()
    }),
    params: Joi.object({
      userId: Joi.string().hex().required()
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
