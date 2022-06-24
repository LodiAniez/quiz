import { EDatabaseTables } from "./../enums/main";

export interface IInsertPayload {
	table: EDatabaseTables;
	values: any[];
}

export interface IUpdatePayload {
	id: number;
	table: EDatabaseTables;
	references: {
		key: string;
		value: any
	}[]
}

export interface IDeletePayload {
	table: EDatabaseTables;
	id: number[];
}

export interface ISelectPayload {
	table: EDatabaseTables;
	references?: {
		key: string;
		value: string;
	}[];
	customQuery?: string;
}