export interface IFetchedChoice {
	id: number;
	title: string;
	status: "saved" | "published";
	linkcode: string;
	quizid: number;
	type: "single" | "multiple";
	question: string;
	questionid: number;
	label: string;
	checkanswer: number;
}