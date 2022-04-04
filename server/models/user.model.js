import { DataTypes } from "sequelize";

const bcrypt = require("bcrypt");

/**
 * User Schema
 */
export default {
  name: "User",
  attribute: {
    employeeNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    employeeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  options: {
    freezeTableName: true,
    instanceMethods: {
      generateHash(password) {
        return bcrypt.hash(password, bcrypt.genSaltSync(8));
      },
      validPassword(password) {
        return bcrypt.compare(password, this.password);
      }
    }
  }
};
