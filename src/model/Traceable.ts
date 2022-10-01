import { Identifiable } from "@hfadmin/runtime";

export interface Traceable extends Identifiable {
	createdById?: number;

	createdOn: Date;
}
