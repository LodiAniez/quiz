import mysql from "mysql"
import { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } from "./../secrets/index"

export const connection = mysql.createConnection({
	host: DB_HOST,
	database: DB_NAME,
	user: DB_USER,
	password: DB_PASSWORD
})