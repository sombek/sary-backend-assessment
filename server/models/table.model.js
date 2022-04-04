import { DataTypes } from "sequelize";

export default {
  name: "Table",
  attribute: {
    tableNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    tableSeats: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  options: {
    freezeTableName: true
  }
};
