/**
 * NOTE: This file is generated, do not make changes to it.
 */
import { Build } from '@tverstraten/hf-model'
import { AbstractMutableDac } from './AbstractMutableDac'

/**
 * NOTE: This class is generated, do not make changes to it.
 */
export class GeneratedBuildDac extends AbstractMutableDac<Build> 
{
	constructor(userId: number) {
		super(Build, userId)
	}
	
	protected getTableName(): string {
		return 'Builds'
	}

	// eslint-disable-next-line max-lines-per-function
	protected fromRow(row: any): Build {
		const result = new Build()
		const resultAny = result as any
		result.id = row['id'] // int
		result.createdById = row['createdById'] == null ? undefined : row['createdById'] // int
		resultAny.createdBy = (): any => { throw new RangeError(`Property createdBy was not loaded from database`)} // User
		result.createdOn = row['createdOn'] == null ? undefined : new Date(row['createdOn']) // dateTime
		result.objectVersion = row['objectVersion'] // int
		result.lastUpdatedById = row['lastUpdatedById'] == null ? undefined : row['lastUpdatedById'] // int
		resultAny.lastUpdatedBy = (): any => { throw new RangeError(`Property lastUpdatedBy was not loaded from database`)} // User
		result.lastUpdatedOn = row['lastUpdatedOn'] == null ? undefined : new Date(row['lastUpdatedOn']) // dateTime
		result.isDeleted = row['isDeleted'] == 1 // boolean
		result.withinOrganizationId = row['withinOrganizationId'] // int
		resultAny.withinOrganization = (): any => { throw new RangeError(`Property withinOrganization was not loaded from database`)} // Organization
		result.forSystemId = row['forSystemId'] // int
		resultAny.forSystem = (): any => { throw new RangeError(`Property forSystem was not loaded from database`)} // SystemDescription
		result.startedOn = new Date(row['startedOn']) // dateTime
		result.finishedOn = row['finishedOn'] == null ? undefined : new Date(row['finishedOn']) // dateTime
		result.builtById = row['builtById'] == null ? undefined : row['builtById'] // int
		resultAny.builtBy = (): any => { throw new RangeError(`Property builtBy was not loaded from database`)} // User
		result.triggeredById = row['triggeredById'] == null ? undefined : row['triggeredById'] // int
		resultAny.triggeredBy = (): any => { throw new RangeError(`Property triggeredBy was not loaded from database`)} // User

		return result
	}
}
