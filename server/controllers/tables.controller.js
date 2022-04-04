import httpStatus from "http-status";
import db from "../../config/sequelize";
import APIError from "../helpers/APIError";

const { Table } = db;


function create(req, res, next) {
  const table = Table.build({
    tableNumber: req.body.tableNumber,
    tableSeats: req.body.tableSeats
  });

  table.save()
    .then((table) => res.json(table))
    .catch((e) => {
      if (e.name === "SequelizeUniqueConstraintError")
        return next(new APIError("Table Number is duplicated", httpStatus.BAD_REQUEST, true));
      else
        next(e);
    });
}

function list(req, res) {
  Table.findAll().then(tables => res.json(
    tables.map(table => ({
      tableNumber: table.tableNumber,
      tableSeats: table.tableSeats
    }))
  ));
}

function deleteTable(req, res) {
  // TODO: check if it has reservations
  Table.destroy({ where: { tableNumber: req.params.tableNumber } })
    .then(deletedTable => res.json({ rowsAffected: deletedTable }));
}


export default {
  create,
  list,
  deleteTable
};
