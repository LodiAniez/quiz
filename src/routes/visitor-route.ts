import { EDatabaseTables } from './../enums/main';
import { select } from './../utils/query';
import { respondError, ErrorException } from './../utils/util';
import { Router, Request, Response } from "express"
import { ICreateQuizPayload } from './../models/api-payload';
import { IFetchedChoice } from './../models/common';

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
																								label: y.label,
																								checkanswer: y.checkanswer > 0
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

export default app