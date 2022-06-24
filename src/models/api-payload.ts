export interface IUser {
	id?: number;
	email: string;
	password: string;
	validated: boolean;
}

export interface IAuthPayload {
	email: string;
	password: string;
}