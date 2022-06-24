export enum EDatabaseTables {
	USER = "m_user",
	QUIZ = "m_quiz",
	QUESTIONS = "m_questions",
	CHOICES = "m_choices",
	ANSWERS = "u_answers"
}

export const EDatabaseTableColumns = {
	USER: ["email", "password", "validated"],
	QUIZ: ["title", "status", "linkcode"],
	QUESTIONS: ["quizid", "type", "question"],
	CHOICES: ["questionid", "label", "checkanswer"],
	ANSWERS: ["questionid", "answers", "iscorrect"]
}