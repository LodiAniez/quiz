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
}

export interface IQuizQuestions {
	id?: number;
	type: "single" | "multiple",
	question: string;
	choices: IQuestionChoices[];
}

export interface ICreateQuizPayload {
	id?: number;
	title: string;
	status: "saved" | "published";
	questions: IQuizQuestions[];
	linkcode?: string;
	permalink?: string;
}