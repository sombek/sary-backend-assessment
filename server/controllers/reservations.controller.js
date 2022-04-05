import db from "../../config/sequelize";
import { Op } from "sequelize";
import moment from "moment";

const { Table } = db;


function list(req, res, next) {
  Table.findAll({
    where: { tableSeats: { [Op.gte]: +req.params.numberOfCustomers } },
    order: [ [ "tableSeats", "ASC" ] ]
  })
    .then((tables) => {
      let selectedTables = tables.filter(table => table.tableSeats === tables[0].tableSeats);
      // get available times for each table
      // start from now to 11:59pm
      selectedTables = selectedTables.map(table => {
        // get schedules for this table
        // if Date.now > 2:00pm start from Date.now
        // else start with full working hours
        const officialStartWorkingHour = moment("14:00", "HH:mm");
        const officialEndWorkingHour = moment("23:59", "HH:mm");
        let startWorkingHour = officialStartWorkingHour;

        if (moment().isSameOrAfter(officialStartWorkingHour))
          startWorkingHour = moment();
        return {
          tableNumber: table.tableNumber,
          tableSeats: table.tableSeats,
          timeSlots: [ startWorkingHour.format("HH:mmA") + " - " + officialEndWorkingHour.format("HH:mmA") ]
        };
      });

      return res.json(selectedTables);
    })
    .catch((e) => next(e));
}


export default {
  list
};
