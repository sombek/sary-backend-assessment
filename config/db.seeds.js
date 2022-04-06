import bcrypt from "bcrypt";
import db from "./sequelize";

const { User } = db;

export var seedUsers = async () => {
  var adminUser = await User.findOne({
    where: { employeeNumber: "1000" }
  });
  if (!adminUser) {
    const user = User.build({ name: "Admin User", employeeNumber: "1000", employeeType: "Admin", password: "123456" });
    user.password = bcrypt.hashSync(user.password, 10);
    user.save();
  }
};
