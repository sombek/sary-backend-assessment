import db from "../../config/sequelize";
import { Op } from "sequelize";
import moment from "moment";
import APIError from "../helpers/APIError";
import httpStatus from "http-status";

const { Table, Reservation } = db;
const format = "hh:mmA";

async function getTableTimeChunks(table) {
  /*
 * Algorithm:
 * - You always start with one big chunk - assuming Date.now <= 2:00pm
 *   Chunk1 [2:00pm - 11:59pm] [ C_s - C_e ]
 *
 * - Get all reservations for each table R_s=start R_e=end
 *
 * - Find the proper chunk by this condition (R_s >= C_s && R_e <= C_e)
 *   If both are true select the chunk.
 *
 * - Create 2 new chunks [ C_s - R_s ] [ R_e - C_e ]
 *
 * - Remove old chunk
 *
 * - If a chunk == [ N - N ] same number, remove it
 * */

  return new Promise(async (resolve, reject) => {
    const tableNumber = table.tableNumber;
    let startWorkingHour;
    const officialStartWorkingHour = startWorkingHour = moment("02:00pm", format);
    const endWorkingHour = moment("11:59pm", format);

    // moment() == current time
    if (moment().isSameOrAfter(officialStartWorkingHour))
      startWorkingHour = moment();

    // initial timeChunks
    let timeChunks = [
      { startingTime: startWorkingHour, endingTime: endWorkingHour }
    ];

    // get reservations for this table
    const reservations = await Reservation.findAll({ where: { tableNumber } });

    // moment each object
    reservations.map(r => r.startingTime = moment(r.startingTime, format));
    reservations.map(r => r.endingTime = moment(r.endingTime, format));


    reservations.forEach(reservation => {
      let properTimeChunkIndex = timeChunks.findIndex(chunk => reservation.startingTime >= chunk.startingTime && reservation.endingTime <= chunk.endingTime);
      if (properTimeChunkIndex === -1) return;

      let properTimeChunk = timeChunks[properTimeChunkIndex];

      // timeChunks creation
      timeChunks.push({ startingTime: properTimeChunk.startingTime, endingTime: reservation.startingTime });
      timeChunks.push({ startingTime: reservation.endingTime, endingTime: properTimeChunk.endingTime });

      // timeChunks filters
      timeChunks.splice(properTimeChunkIndex, 1);
      timeChunks = timeChunks.filter(chunk => !chunk.endingTime.isSame(chunk.startingTime));
    });

    timeChunks.sort((a, b) => {
      return a.startingTime - b.startingTime;
    });

    return resolve(timeChunks);
  });


}

function list(req, res, next) {
  Table.findAll({
    where: { tableSeats: { [Op.gte]: +req.params.numberOfCustomers } },
    order: [ [ "tableSeats", "ASC" ] ]
  })
    .then(async (tables) => {
      if (tables.length === 0)
        return next(new APIError("Number of customers is bigger than biggest table size", httpStatus.BAD_REQUEST, true));

      // all tables which have the same table seats number
      let selectedTables = tables.filter(table => table.tableSeats === tables[0].tableSeats);
      selectedTables = await Promise.all(
        selectedTables.map(async table => {
          const timeChunks = await getTableTimeChunks(table);
          timeChunks.map(c => c.startingTime = c.startingTime.format(format));
          timeChunks.map(c => c.endingTime = c.endingTime.format(format));
          return {
            tableNumber: table.tableNumber,
            tableSeats: table.tableSeats,
            timeSlots: timeChunks
          };
        })
      );

      return res.json(selectedTables);
    })
    .catch((e) => next(e));

}

function create(req, res, next) {
  let { tableNumber, startingTime, endingTime } = req.body;
  startingTime = moment(startingTime, format);
  endingTime = moment(endingTime, format);

  if (startingTime.isSameOrAfter(endingTime))
    return next(new APIError("Starting time cannot be after or same ending time", httpStatus.BAD_REQUEST, true));

  Table.findOne({ where: { tableNumber } })
    .then(async (table) => {
      if (table === null)
        return next(new APIError("Table not found", httpStatus.BAD_REQUEST, true));

      const timeChunks = await getTableTimeChunks(table);
      let properTimeChunkIndex = timeChunks.findIndex(chunk => startingTime >= chunk.startingTime && endingTime <= chunk.endingTime);
      if (properTimeChunkIndex === -1)
        return next(new APIError("Selected reservation is not available", httpStatus.BAD_REQUEST, true));

      // insert new reservation
      const reservation = Reservation.build({
        tableNumber: table.tableNumber,
        startingTime: startingTime.format(format),
        endingTime: endingTime.format(format)
      });

      reservation.save()
        .then((reservation) => res.json(reservation))
        .catch((e) => {
          if (e.name === "SequelizeUniqueConstraintError")
            return next(new APIError("Table Number is duplicated", httpStatus.BAD_REQUEST, true));
          else
            next(e);
        });
    }).catch((e) => next(e));
}


export default {
  list, create
};
