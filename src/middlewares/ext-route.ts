import { Express } from "express"
import authRoute from "./../routes/auth-route"
import quizRoute from "./../routes/quiz-route"
import visitorRoute from "./../routes/visitor-route"
import { authenticateToken } from "./auth"

export const route = (app: Express) => {
	app.use("/auth", authRoute)											/** <-- This is where token creds are generated */
	app.use("/quiz", authenticateToken, quizRoute)	/** <-- Protected routes, cannot be accessed without a valid token */
	app.use("/visitor", visitorRoute)								/** <-- Public route, can be accessed by anyone using the generated permalink */
}