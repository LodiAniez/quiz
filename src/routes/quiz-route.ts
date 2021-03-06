import { Router, Request, Response } from "express"
import { ICreateQuizPayload, IQuizQuestions } from "./../models/api-payload";
import { respondError, ErrorException } from './../utils/util';
import { insert, select, update } from '../utils/query';
import { EDatabaseTables } from "./../enums/main";
import { IQuestionChoices, IEditItemPayload } from '../models/api-payload';
import { PORT } from "./../secrets/index"
import { IFetchedChoice } from "./../models/common";

const app = Router()

app.post("/edit", async (req: Request, res: Response) => {
	try {
		/**
		 * 
		 * Items can be edited individually, i.e, by quiz, by question and by choice
		 */
		const { quiz, questions, choices }: IEditItemPayload = req.body
		const { QUIZ, QUESTIONS, CHOICES } = EDatabaseTables

		/** if `quiz` key is not undefined, this means that this quiz is modified from frontend */
		if (quiz) {
			await update({
				table: QUIZ,
				references: [
					{
						key: "title",
						value: quiz.title
					},
					{
						key: "status",
						value: quiz.status
					}
				],
				id: quiz.id
			})
		}

		/** if `questions` key length value is not 0, this means that a question is modified from frontend */
		if (questions.length) {
			const updateQuestions = [...questions].map(question => {
				return update({
					table: QUESTIONS,
					id: question.id,
					references: [
						{
							key: "type",
							value: question.type
						},
						{
							key: "question",
							value: question.question
						}
					]
				})
			})

			await Promise.all(updateQuestions)
		}

		/** if `choices` key length value is not 0, this means that an option/choice is modified from frontend */
		if (choices.length) {
			const updateChoices = [...choices].map(choice => {
				return update({
					table: CHOICES,
					id: choice.id,
					references: [
						{
							key: "label",
							value: choice.label
						},
						{
							key: "checkanswer",
							value: choice.checkanswer
						}
					]
				})
			})

			await Promise.all(updateChoices)
		}

		res.status(200).send({
			message: "Data are successfully updated."
		})
	} catch (err) {
		respondError(res, err)
	}
})

app.get("/list", async (req: Request, res: Response) => {
	try {
		const { QUIZ, QUESTIONS, CHOICES } = EDatabaseTables

		const result = await select({
			customQuery: `select * from ${QUIZ} inner join ${QUESTIONS} inner join ${CHOICES} on ${QUIZ}.id=${QUESTIONS}.quizid and ${QUESTIONS}.id=${CHOICES}.questionid`
		})

		const list: ICreateQuizPayload[] = []

		await Promise.resolve(
			result.forEach((res: IFetchedChoice) => {
				const isSaved = list.find((data: ICreateQuizPayload) => data.id === res.quizid)
				
				if (!isSaved) {
					const questionData = [...result].filter((x: IFetchedChoice) => x.quizid === res.quizid)
					
					/**
					 * 
					 * `edited` flag should update to true if either the quiz itself, or a specific question, or a specific choice/option is modified from frontend
					 * so we can only query to the database those items that have been modified from the frontend (during the editing process)
					 * we can filter those out using the `edited` flag
					 * in this way, it can greatly help for query optimization
					 * 
					 * quiz level has the `edited` flag, update this to true if quiz title is modified from frontend
					 * question level has the `edited` flag, update this to true if question properties, i.e, type and question properties, are modified from frontend
					 * choice/option level has the `edited` flag, update this to true if choice properties, i.e, label and checkanswer properties are modified from frontend
					 * `editable` flag gives the idea of whether the item is editable or not
					 */
					list.push({
						edited: false,
						editable: res.status === "saved",
						id: res.quizid,
						title: res.title,
						status: res.status,
						questions: [...new Map(questionData.map(item => [item["questionid"], item])).values()]	/** <-- So we could filter out the duplicate choices */
												.map((x: IFetchedChoice): IQuizQuestions => ({
													id: x.questionid,
													type: x.type,
													question: x.question,
													choices: [...result].filter((y: IFetchedChoice) => y.questionid === x.questionid)
																							.map((y: IFetchedChoice): IQuestionChoices => ({
																								id: y.id,
																								label: y.label,
																								checkanswer: y.checkanswer > 0,
																								edited: false,
																								editable: y.quizid === res.quizid && res.status === "saved"
																							})),
													edited: false,
													editable: x.quizid === res.quizid && res.status === "saved"
												})),
						linkcode: res.linkcode,
						permalink: res.linkcode ? `http://localhost:3000/visitor/view/${res.linkcode}` : null
					})
				}
			})
		)

		res.status(200).send({
			message: "List successfully fetched.",
			data: { list }
		})
	} catch (err) {
		respondError(res, err)
	}
})

app.post("/create", async (req: Request, res: Response) => {
	try {
		const { title, questions, status }: ICreateQuizPayload = req.body

		const NUMBER_OF_QUESTIONS = 20	/** Should be 20 */
		const NUMBER_OF_CHOICES = 10		/** Should be 10 */

		/**
		 * 
		 * Checking the number of questions in a single quiz (should have 20 questions)
		 * Based on the requirements
		 */
		if (questions.length < NUMBER_OF_QUESTIONS) {
			throw new ErrorException(`There should be ${NUMBER_OF_QUESTIONS} questions present in a single quiz.`)
		}

		const invalidQuestion: { errorDescription: string; } = {
			errorDescription: null
		}
		
		questions.every((question, index) => {
			if (question.type === "single") {
				const checkAnswers = [...question.choices].filter(choice => choice.checkanswer === true)

				/** 
			  * 
			  * Check for invalid question (if type and choices does not match) 
			  * It does not make any sense if question type is single but has multiple possible correct choices, right?
			  */
				if (checkAnswers.length > 1) {
					invalidQuestion["errorDescription"] = `Question No. ${index+1} (${question.question}) is labeled as single-correct-answer but has multiple correct choices.`
					return true
				}

				if (!checkAnswers.length) {
					invalidQuestion["errorDescription"] = `Question No. ${index+1} should have atleast 1 correct answer set.`
					return true
				}

				/**
			  * 
			  * Checking the number of choices in every question (Each question should have 10 choices)
			  * Based on the requirements
			  */
				if (question.choices.length < NUMBER_OF_CHOICES) {
					invalidQuestion["errorDescription"] = `Question No. ${index+1} should have ${NUMBER_OF_CHOICES} choices.`
					return true
				}
			}
		})

		if (invalidQuestion.errorDescription) {
			throw new ErrorException(invalidQuestion.errorDescription)
		}
		
		/** Create permalink if status is published */
		const generateLink = () => Math.round((Math.pow(36, 13) - Math.random() * Math.pow(36, 12))).toString(36).slice(1)
		const linkcode: string = status === "published"
										? generateLink()
										: null

		/** Create quiz */
		const createdQuiz = await insert({
			table: EDatabaseTables.QUIZ,
			values: [title, status, linkcode]
		})

		const quizId: number = createdQuiz?.insertId
		
		const questionQueries = [...questions].map((question: IQuizQuestions) => {
			return insert({
				table: EDatabaseTables.QUESTIONS,
				values: [quizId, question.type, question.question]
			})
		})

		const addedQuestions = await Promise.all(questionQueries)

		const choices: IQuestionChoices[] = [] 

		await Promise.resolve(
			addedQuestions.forEach((res, index) => {
				const questionId = res?.insertId
				const addedChoices = questions[index]["choices"]

				addedChoices.forEach(choice => {
					choices.push({
						id: questionId,
						label: choice.label,
						checkanswer: choice.checkanswer
					})
				})
			})
		)

		const choicesQueries = [...choices].map(choice => {
			return insert({
				table: EDatabaseTables.CHOICES,
				values: [choice.id, choice.label, choice.checkanswer]
			})
		})

		await Promise.all(choicesQueries)

		res.status(200).send({
			message: status === "published" ? `Quiz is successfully published, you can check the newly published quiz in this link http://localhost:${PORT}/visitor/view/${linkcode}.` : "Quiz is successfully saved.",
			data: {
				permalink: status === "published" ? `http://localhost:${PORT}/visitor/view/${linkcode}` : null
			}
		})
	} catch (err) {
		respondError(res, err)
	}
})

export default app