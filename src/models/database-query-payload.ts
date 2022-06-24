import { EDatabaseTables } from "./../enums/main";

export interface IInsertPayload {
	table: EDatabaseTables;
	values: any[];
}

export interface IUpdatePayload extends IInsertPayload {
	id: number;
}

export interface IDeletePayload {
	table: EDatabaseTables;
	id: number[];
}

export interface ISelectPayload {
	table: EDatabaseTables;
}