import { Express } from "express"
import authRoute from "./../routes/auth-route"
import quizRoute from "./../routes/quiz-route"

export const route = (app: Express) => {
	app.use("/auth", authRoute)
	app.use("/quiz", quizRoute)
}