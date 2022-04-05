import db from "../../config/sequelize";
import { Op } from "sequelize";
import moment from "moment";

const { Table } = db;


function list(req, res, next) {
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
  const format = "hh:mmA";
  Table.findAll({
    where: { tableSeats: { [Op.gte]: +req.params.numberOfCustomers } },
    order: [ [ "tableSeats", "ASC" ] ]
  })
    .then((tables) => {
      // all tables which have the same table seats number
      let selectedTables = tables.filter(table => table.tableSeats === tables[0].tableSeats);

      // loop on each table
      selectedTables = selectedTables.map(table => {
        let startWorkingHour;
        const officialStartWorkingHour = startWorkingHour = moment("02:00pm", format);
        const endWorkingHour = moment("11:59pm", format);

        // moment() == current time
        if (moment().isSameOrAfter(officialStartWorkingHour))
          startWorkingHour = moment();

        // initial timeChunks
        let timeChunks = [
          { s: startWorkingHour, e: endWorkingHour }
        ];

        // get reservations for this table
        const reservations = [
          { s: "2:00pm", e: "2:10pm" },
          { s: "2:20pm", e: "2:30pm" },
          { s: "2:30pm", e: "3:00pm" },
          { s: "3:00pm", e: "4:00pm" },
          { s: "6:00pm", e: "7:00pm" },
          { s: "10:00pm", e: "10:30pm" }
        ];

        // moment each object
        reservations.map(r => r.s = moment(r.s, format));
        reservations.map(r => r.e = moment(r.e, format));

        reservations.forEach(reservation => {
          let properTimeChunkIndex = timeChunks.findIndex(chunk => reservation.s >= chunk.s && reservation.e <= chunk.e);
          if (properTimeChunkIndex === -1) return;

          let properTimeChunk = timeChunks[properTimeChunkIndex];

          // timeChunks creation
          timeChunks.push({ s: properTimeChunk.s, e: reservation.s });
          timeChunks.push({ s: reservation.e, e: properTimeChunk.e });

          // timeChunks filters
          timeChunks.splice(properTimeChunkIndex, 1);
          timeChunks = timeChunks.filter(chunk => !chunk.e.isSame(chunk.s));
        });

        timeChunks.sort((a, b) => {
          return a.s - b.s;
        });
        timeChunks.map(c => c.s = c.s.format(format));
        timeChunks.map(c => c.e = c.e.format(format));

        return {
          tableNumber: table.tableNumber,
          tableSeats: table.tableSeats,
          timeSlots: timeChunks
        };

      });

      return res.json(selectedTables);
    })
    .catch((e) => next(e));
}


export default {
  list
};
