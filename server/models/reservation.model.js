import { DataTypes } from "sequelize";

export default {
  name: "Reservation",
  attribute: {
    tableNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    startingTime: {
      type: DataTypes.STRING,
      allowNull: false
    },
    endingTime: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  options: {
    freezeTableName: true
  }
};
