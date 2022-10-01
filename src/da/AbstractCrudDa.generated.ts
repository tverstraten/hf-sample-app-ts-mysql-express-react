import { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { AbstractDa } from './AbstractDa.generated'
import { FindResults } from './FindResults.generated'

/**
 * a representation of a where clause
 */
class WhereClause {
	sqlText?: string
	valuesToBind: any

	constructor(text: string, params: any) {
		this.sqlText = text
		this.valuesToBind = params
	}
}

/**
 * NOTE: This file is generated, do not make changes to it.
 */
export abstract class AbstractCrudDa<T> extends AbstractDa {
	abstract getTableName(): string

	abstract getIdColumnName(): string

	abstract getDefaultOrderByColumnName(): string

	protected fromRow(row: any): T {

		const result = this.constructor()
		const resultAny = result as any
		Object.keys(row).forEach((columnName) => {
			resultAny[columnName] = row[columnName]
		})

		return result
	}

	async findOneById(id: number): Promise<T> {
		try {
			const sql = `SELECT * FROM \`${this.getTableName()}\` WHERE \`${this.getIdColumnName()}\` = ?`
			const queryResults = (await this.executePrepared(sql, [id])) as RowDataPacket[]

			let findResult
			if (queryResults != null) {
				queryResults.forEach((row) => {
					findResult = this.fromRow(row) as T
				})
			}

			if (findResult == null) throw RangeError(`findOneById(${id}) Object with the given id does not exist`)
			return findResult
		} catch (problem) {
			console.log(`findOneById(${id}) failed reason ${problem}`)
			throw problem
		}
	}

	async findBy(where: string, params: any[] = [], orderBy?: string, page = 1, pageSize = 20): Promise<FindResults<T>> {
		return this.findBySafe(where, params, orderBy, page, pageSize)
	}

	async findBySafe(where: string, params: any[] = [], orderBy?: string, page = 1, pageSize = 20): Promise<FindResults<T>> {
		try {
			const selectList = ` SQL_CALC_FOUND_ROWS *`
			const fromFragment = ` FROM \`${this.getTableName()}\``
			const whereFragment = where ? ` WHERE ${where}` : ''
			const orderByFragment = orderBy ? ` ORDER BY ${orderBy}` : ''
			const limitFragment = pageSize === -1 ? '' : ` LIMIT ${(page - 1) * pageSize}, ${pageSize}`
			const sql = `SELECT${selectList}${fromFragment}${whereFragment}${orderByFragment}${limitFragment}; SELECT FOUND_ROWS()`
			const queryResults = await this.executePrepared(sql, params)

			const rowResults = (queryResults as any)[0] as RowDataPacket[]
			const overallResults = (queryResults as any)[1] as ResultSetHeader

			const foundObjects = [] as T[]
			if (rowResults != null) {
				rowResults.forEach((row) => {
					foundObjects.push(this.fromRow(row) as T)
				})
			}

			const results = new FindResults<T>()
			results.page = page
			results.rowsPerPage = pageSize
			results.numberOfMatchingRows = overallResults.affectedRows
			results.rows = foundObjects

			return results
		} catch (problem) {
			console.log(`findBy(${where}) failed reason ${problem}`)
			throw problem
		}
	}

	getInsertSqlFragments(values: any): { columnNames: string; parameterMarkers: string; parameters: any[] } {
		let columnNames = ''
		let parameterMarkers = ''
		const parameters = [] as any[]
		Object.keys(values).forEach((columnName) => {
			const columnValue = values[columnName]
			if (columnValue !== undefined) {
				if (columnNames !== '') columnNames += ','
				columnNames += `\`${columnName}\``
				if (parameterMarkers !== '') parameterMarkers += ','
				parameterMarkers += '?'
			}
		})

		return { columnNames: columnNames, parameterMarkers: parameterMarkers, parameters: parameters }
	}

	async insertPartial(values: any): Promise<boolean> {
		const fragments = this.getInsertSqlFragments(values)
		const sql = `INSERT INTO \`${this.getTableName()}\` (${fragments.columnNames}) values (${fragments.parameterMarkers})`
		const executeResult = (await this.executePrepared(sql, fragments.parameters)) as ResultSetHeader

		return executeResult.affectedRows === 1
	}

	async create(newItem: T): Promise<boolean> {
		try {
			const didSucceed = await this.insertPartial(newItem)
			return didSucceed
		} catch (problem) {
			console.log(`create() failed ${JSON.stringify(newItem)} reason ${problem}`)
			throw problem
		}
	}

	async insertPartialAndReturn(values: any): Promise<T> {
		const fragments = this.getInsertSqlFragments(values)
		const sql = `INSERT INTO \`${this.getTableName()}\` (${fragments.columnNames}) values (${fragments.parameterMarkers
			});SELECT * FROM \`${this.getTableName()}\` WHERE \`${this.getIdColumnName()}\` = LAST_INSERT_ID()`
		const executeResult = await this.executePrepared(sql, fragments.parameters)

		// RowDataPacket[] | ResultSetHeader
		const result1 = (executeResult as any)[1] as RowDataPacket[]
		let insertedRow
		if (executeResult != null) {
			result1.forEach((row) => {
				insertedRow = this.fromRow(row)
			})
		}

		if (insertedRow) return insertedRow as T
		throw new RangeError(`Row was not returned from the database`)
	}

	async createAndReturn(newItem: T): Promise<T> {
		try {
			const newRow = await this.insertPartialAndReturn(newItem)
			return newRow
		} catch (problem) {
			console.log(`Create() failed ${JSON.stringify(newItem)} reason ${problem}`)
			throw problem
		}
	}

	getUpdatePartialSqlFragments(values: any): { setFragments: string; parameters: any[] } {
		let setFragments = ''
		const parameters = [] as any[]
		Object.keys(values).forEach((columnName) => {
			const columnValue = values[columnName]
			if (columnValue !== undefined) {
				if (setFragments !== '') setFragments += ','

				if (columnName === 'objectVersion') {
					setFragments += `\`objectVersion\` = \`objectVersion\` + 1`
				} else {
					setFragments += `\`${columnName}\` = ?`
					parameters.push(columnValue)
				}
			}
		})

		return { setFragments: setFragments, parameters: parameters }
	}

	async updatePartial(values: any, whereClause: WhereClause): Promise<number | undefined> {
		const fragments = this.getUpdatePartialSqlFragments(values)
		fragments.parameters = fragments.parameters.concat(whereClause.valuesToBind)

		const sql = `UPDATE \`${this.getTableName()}\` SET ${fragments.setFragments} WHERE ${whereClause.sqlText}`

		const executeResult = await this.executePrepared(sql, fragments.parameters)

		if (executeResult != null) return (executeResult as ResultSetHeader).affectedRows

		return undefined
	}

	async update(itemUpdate: T): Promise<boolean> {
		try {
			const id = (itemUpdate as any)[this.getIdColumnName()];
			const where = new WhereClause(`\`${this.getIdColumnName()}\` = ?`, [id])
			const rowsUpdated = await this.updatePartial(itemUpdate, where)
			return rowsUpdated === 1
		} catch (problem) {
			console.log(`Update failed ${JSON.stringify(itemUpdate)}, reason ${problem}`)
			throw problem
		}
	}

	async updateAndReturnPartial(values: any, whereClause: WhereClause): Promise<T[]> {
		const fragments = this.getUpdatePartialSqlFragments(values)
		fragments.parameters = fragments.parameters.concat(whereClause.valuesToBind)

		const sql = `SET @uids := null;UPDATE \`${this.getTableName()}\` SET ${fragments.setFragments} WHERE ${whereClause.sqlText
			} AND (SELECT @uids := CONCAT_WS(',', \`${this.getIdColumnName()}\`, @uids) ); SELECT * FROM \`${this.getTableName()}\` WHERE \`${this.getIdColumnName()}\` in (@uids);`

		const executeResult = await this.executePrepared(sql, fragments.parameters)

		const updatedRows = (executeResult as any)[2] as RowDataPacket[]

		const results = [] as T[]
		if (updatedRows != null) {
			updatedRows.forEach((row) => {
				const updatedObject = this.fromRow(row)
				results.push(updatedObject)
			})
		}
		return results
	}

	async updateAndReturn(itemUpdate: T): Promise<T> {
			const id = (itemUpdate as any)[this.getIdColumnName()];
		try {
			const where = new WhereClause(`\`${this.getIdColumnName()}\` = ?`, [id])
			const data = await this.updateAndReturnPartial(itemUpdate, where)
			return data[0]
		} catch (problem) {
			console.log(`UpdateAndReturn(${id}) failed ${JSON.stringify(itemUpdate)}, reason ${problem}`)
			throw problem
		}
	}

	async remove(id: number): Promise<boolean> {
		try {
			const sql = `DELETE FROM '${this.getTableName()}' WHERE '${this.getIdColumnName()}' = @id`
			await this.executePrepared(sql, [id])
			return true
		} catch (problem) {
			console.log(`Remove failed ${id} reson ${problem}`)
			throw problem
		}
	}
}
