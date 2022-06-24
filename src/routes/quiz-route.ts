import { Router, Request, Response } from "express"
import { ICreateQuizPayload, IQuizQuestions } from "./../models/api-payload";
import { respondError, ErrorException } from './../utils/util';
import { insert } from '../utils/query';
import { EDatabaseTables } from "./../enums/main";
import { IQuestionChoices } from '../models/api-payload';
import { PORT } from "./../secrets/index"

const app = Router()

app.get("/list", async (req: Request, res: Response) => {
	try {
		res.status(200).send({
			message: "List successfully fetched."
		})
	} catch (err) {
		respondError(res, err)
	}
})

app.post("/create", async (req: Request, res: Response) => {
	try {
		const { title, questions, status }: ICreateQuizPayload = req.body

		const NUMBER_OF_QUESTIONS = 2	/** Should be 20 */
		const NUMBER_OF_CHOICES = 2		/** Should be 10 */

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
			message: status === "published" ? `Quiz is successfully published, you can check the newly published quiz in this link http://localhost:${PORT}/quiz/view/${linkcode}.` : "Quiz is successfully saved.",
			data: {
				permalink: `http://localhost:${PORT}/quiz/view/${linkcode}`
			}
		})
	} catch (err) {
		respondError(res, err)
	}
})

export default app