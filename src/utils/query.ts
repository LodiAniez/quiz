import { connection } from "./../configs/database";
import { IInsertPayload, IUpdatePayload, IDeletePayload, ISelectPayload } from "./../models/database-query-payload";
import { EDatabaseTableColumns, EDatabaseTables } from "./../enums/main";

const mapColumn: (table: string) => string[] = (table: string) => {
	switch (table) {
		case EDatabaseTables.USER:
			return EDatabaseTableColumns.USER
		case EDatabaseTables.QUESTIONS:
			return EDatabaseTableColumns.QUESTIONS
		case EDatabaseTables.QUIZ:
			return EDatabaseTableColumns.QUIZ
		case EDatabaseTables.CHOICES:
			return EDatabaseTableColumns.CHOICES
		case EDatabaseTables.ANSWERS:
			return EDatabaseTableColumns.ANSWERS
		default: return undefined;
	}
}

/**
 * 
 * @param table is the table's name
 * @param values are the values to be inserted, should be in order of type any[] 
 * @returns 
 */
export const insert = ({
	table, values
}: IInsertPayload) => {
	try {
		return new Promise<any>((resolve, reject) => {
			try {
				if (!table) return reject("A table name must be provided.")
				if (!values.length) return reject("Values must be provided.")

				const columns = mapColumn(table)
				if (columns) {
					const executableQuery: string = `INSERT INTO ${table} (${columns.join(", ")}) VALUES(${columns.map(() => "?").join(", ")})`

					connection.query(executableQuery, values, (err, results) => {
						if (err) return reject(err)

						resolve(results)
					})
				} else {
					reject("Table name is invalid.")
				}
			} catch (err) {
				reject(err)
			}
		})
	} catch (err) {
		throw err
	}
}

export const update = async ({
	table, references, id
}: IUpdatePayload) => {
	try {
		return new Promise<any>((resolve, reject) => {
			try {
				if (!id) return reject("A reference id must be provided.")
				if (!table) return reject("A table name must be provided.")
				if (!references.length) return reject("Values must be provided.")

				const columns: string[] = [...references].map(ref => ref.key)
				const values: any[] = [...references].map(ref => ref.value)

				if (columns.length) {
					const executableQuery: string = `UPDATE ${table} SET ${columns.map(col => `${col}=?`).join(", ")} WHERE id=?`

					connection.query(executableQuery, [...values, id], (err, results) => {
						if (err) return reject(err)

						resolve(results)
					})
				} else {
					return reject("Table name is invalid.")
				}
			} catch (err) {
				reject(err)
			}
		})
	} catch (err) {
		throw err
	}
}

export const remove = async ({
	table, id
}: IDeletePayload) => {
	try {
		return new Promise<any>(async (resolve, reject) => {
			try {
				if (!table) return reject("Table name is required.")
				if (!id.length) return reject("Reference id is required.")

				const executableQuery: string = `DELETE FROM ${table} WHERE id in (${[...id].map(() => "?").join(", ")})`

				connection.query(executableQuery, id, (err, results) => {
					if (err) return reject(err)

					resolve(results)
				})
			} catch (err) {
				reject(err)
			}
		})
	} catch (err) {
		throw err
	}
}

export const select = async ({
	table,
	references,
	customQuery
}: ISelectPayload) => {
	try {
		return new Promise<any>((resolve, reject) => {
			try {
				if (!table && !customQuery) return reject("Table name is required.")
				
				const executableQuery: string = customQuery 
																			? customQuery 
																			: (!references || !references.length) 
																			? `SELECT * FROM ${table}` 
																			: `SELECT * FROM ${table} WHERE ${references.map(({ key }) => `${key}=?`).join(" AND ")}`
				console.log(executableQuery)

				const values: any[] = !customQuery && references && references.length 
														? [...references].map(ref => ref.value) 
														: []
				
				connection.query(executableQuery, values, (err, results) => {
					if (err) return reject(err)

					resolve(results)
				})
			} catch (err) {
				reject(err)
			}
		})
	} catch (err) {
		throw err
	}
}