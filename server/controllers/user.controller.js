import httpStatus from "http-status";
import db from "../../config/sequelize";
import APIError from "../helpers/APIError";

const bcrypt = require("bcrypt");
const { User } = db;


function load(req, res, next, id) {
  User.findOne({ where: { id } })
    .then((user) => {
      if (!user) {
        const e = new Error("User does not exist");
        e.status = httpStatus.NOT_FOUND;
        return next(e);
      }
      req.user = user; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch((e) => next(e));
}

function get(req, res) {
  return res.json(req.user);
}

function create(req, res, next) {
  const user = User.build({
    name: req.body.name,
    employeeNumber: req.body.employeeNumber,
    employeeType: req.body.employeeType,
    password: req.body.password
  });
  user.password = bcrypt.hashSync(req.body.password, 10);

  user.save()
    .then((savedUser) => res.json(savedUser))
    .catch((e) => {
      if (e.name === "SequelizeUniqueConstraintError")
        return next(new APIError("Employee Number is duplicated", httpStatus.BAD_REQUEST, true));
      else
        next(e);
    });
}


function update(req, res, next) {
  const { user } = req;
  user.username = req.body.username;
  user.mobileNumber = req.body.mobileNumber;

  user.save()
    .then((savedUser) => res.json(savedUser))
    .catch((e) => next(e));
}


function list(req, res, next) {
  const { limit = 50 } = req.query;
  User.findAll({ limit })
    .then((users) => res.json(users))
    .catch((e) => next(e));
}


export default {
  load, get, create, update, list
};
