import { db } from "../lib/db.js";
import fs from "fs";

async function initDatabase() {
  try {
    const sql = fs.readFileSync("database/init_db.sql", "utf-8");
    await db.query(sql);
    console.log("Base de datos inicializada con éxito");
    process.exit(0);
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
    process.exit(1);
  }
}

initDatabase();
