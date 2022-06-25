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

export interface IQuestionChoices {
	id?: number;
	label: string;
	checkanswer?: boolean;
	edited?: boolean;
	editable?: boolean;
}

export interface IQuizQuestions {
	id?: number;
	type: "single" | "multiple",
	question: string;
	choices: IQuestionChoices[];
	edited?: boolean;
	editable?: boolean;
}

export interface ICreateQuizPayload {
	id?: number;
	title: string;
	status: "saved" | "published";
	questions: IQuizQuestions[];
	linkcode?: string;
	permalink?: string;
	edited?: boolean;
	editable?: boolean;
	userid?: string;	/** This is the visitor's generated random id when he visits the permalink, will be used to record his answers */
}

export interface IEditQuizPayload {
	id: number;
	title: string;
	status: "saved" | "published";
}

export interface IEditQuestionPayload {
	id: number;
	type: "single" | "multiple";
	question: string;
}

export interface IEditOptionPayload {
	id: number;
	label: string;
	checkanswer: boolean;
}

export interface IEditItemPayload {
	quiz: IEditQuizPayload;
	questions: IEditQuestionPayload[];
	choices: IEditOptionPayload[];
}