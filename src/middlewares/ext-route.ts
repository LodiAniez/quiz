import { Express } from "express"
import authRoute from "./../routes/auth-route"

export const route = (app: Express) => {
	app.use("/auth", authRoute)
}