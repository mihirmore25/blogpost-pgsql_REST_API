import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import pg from "pg";

export const db = new pg.Client({
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    port: process.env.POSTGRES_PORT,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
});
