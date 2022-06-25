import { EDatabaseTables } from './../enums/main';
import { select, insert } from './../utils/query';
import { respondError, ErrorException } from './../utils/util';
import { Router, Request, Response } from "express"
import { ICreateQuizPayload, IAnswerQuizPayload } from './../models/api-payload';
import { IFetchedChoice } from './../models/common';
import { IQuestionsAnswered } from '../models/api-payload';

const app = Router()

app.get("/view/:linkcode", async (req: Request, res: Response) => {
	try {
		const { linkcode } = req.params
		const { QUIZ, QUESTIONS, CHOICES } = EDatabaseTables

		if (!linkcode) throw new ErrorException("Quiz could not be found.", 404)

		const result = await select({
			customQuery: `select * from ${QUIZ} inner join ${QUESTIONS} inner join ${CHOICES} where ${QUIZ}.linkcode='${linkcode}' and ${QUIZ}.id=${QUESTIONS}.quizid and ${QUESTIONS}.id=${CHOICES}.questionid`
		})

		if (!result.length) throw new ErrorException("Quiz could not be found.", 404)

		const list: ICreateQuizPayload = {} as ICreateQuizPayload

		await Promise.resolve(
			result.forEach((res: IFetchedChoice) => {
				const questionData = [...result].filter((x: IFetchedChoice) => x.quizid === res.quizid)

				list.id = res.quizid
				list.title = res.title
				list.status = res.status
				list.questions = [...new Map(questionData.map(item => [item["questionid"], item])).values()]	/** <-- So we could filter out the duplicate choices */
												.map((x: IFetchedChoice) => ({
													id: x.questionid,
													type: x.type,
													question: x.question,
													choices: [...result].filter((y: IFetchedChoice) => y.questionid === x.questionid)
																							.map((y: IFetchedChoice) => ({
																								id: y.id,
																								label: y.label
																							}))
												}))
				list.linkcode = res.linkcode
				list.permalink = res.linkcode ? `http://localhost:3000/visitor/view/${res.linkcode}` : null
				list.userid = `user-${Date.now()}` /** <-- Visitor's generated ID when he visits this endpoint to take the quiz */
			})
		)

		res.status(200).send({
			message: "Quiz is successfully fetched.",
			data: list
		})
	} catch (err) {
		respondError(res, err)
	}
})

app.post("/answer", async (req: Request, res: Response) => {
	try {
		const { userid, quizid, questionsanswered }: IAnswerQuizPayload = req.body

		if (!userid) throw new ErrorException("Pass the generated user ID in the payload.")
		if (!quizid) throw new ErrorException("Invalid quiz.")

		/** Get all the questions correct choices */
		const choiceQueries = [...questionsanswered].map(question => {
			return select({
				table: EDatabaseTables.CHOICES,
				columns: ["id", "questionid"],
				references: [
					{
						key: "questionid",
						value: question.id.toString()
					},
					{
						key: "checkanswer",
						value: "1"
					}
				]
			})
		})

		const correctAnswersResult = (await Promise.all(choiceQueries)).map(res => res[0])
		let score: number = 0

		interface IVisitorAnswer {
			userid: string;
			questionid: number;
			answers: number[];
			iscorrect: boolean;
		}

		const visitorAnswers: IVisitorAnswer[] = []

		/** Calculate visitor's score */
		const correctAnswers: IQuestionsAnswered[] = []

		await Promise.resolve(
			[...questionsanswered].forEach(question => {
				const answerKey = [...correctAnswersResult].filter(ans => ans.questionid == question.id)
				
				correctAnswers.push({
					id: question.id,
					answers: [...answerKey.map(x => x.id)]
				})
			})
		)
		
		await Promise.resolve(
			[...questionsanswered].forEach(question => {
				let iscorrect: boolean = true

				const rightAnswers: number[] = correctAnswers.find(ans => ans.id === question.id)["answers"]

				for (let x of question.answers) {
					if (!rightAnswers.includes(x)) {
						iscorrect = false
						break
					}
				}

				visitorAnswers.push({
					userid,
					questionid: question.id,
					answers: question.answers,
					iscorrect
				})

				if (iscorrect) {
					score += 1
				}
			})
		)

		const saveAnswerQueries = [...visitorAnswers].map(answers => {
			return insert({
				table: EDatabaseTables.ANSWERS,
				values: [answers.userid, answers.questionid, JSON.stringify(answers.answers), answers.iscorrect]
			})
		})

		await Promise.all([
			/** Save visitor details */
			insert({
				table: EDatabaseTables.VISITOR,
				values: [userid, quizid, score]
			}),

			/** Save visitor answers */
			...saveAnswerQueries
		])

		res.status(200).send({
			message: "Answers saved successfully.",
			data: {
				totalquestions: questionsanswered.length,
				score
			}
		})
	} catch (err) {
		respondError(res, err)
	}
})

export default app