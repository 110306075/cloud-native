import fs from "fs";
import path from "path";
import { Sequelize, DataTypes } from "sequelize";
import { fileURLToPath } from "url";
import { initializeAssociations } from "./associations.js";
import configFile from "../config/config.json" assert { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = configFile[env];

const db = {};
let sequelize;

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

const modelFiles = fs.readdirSync(__dirname).filter((file) => {
  return (
    file.indexOf(".") !== 0 &&
    file !== basename &&
    file !== "associations.js" &&
    file.endsWith(".js") &&
    !file.endsWith(".test.js")
  );
});

for (const file of modelFiles) {
  const modelImport = await import(path.join(__dirname, file));
  const initModelFunc = modelImport.default;
  const model = initModelFunc(sequelize, DataTypes);
  db[model.name] = model;
}

initializeAssociations(db);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
