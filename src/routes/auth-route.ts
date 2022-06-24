import { Router, Response, Request } from "express"
import { respondError, ErrorException, hashPassword, sendValidationEmail } from '../utils/util';
import { IAuthPayload } from '../models/api-payload';
import { insert } from '../utils/query';
import { EDatabaseTables } from '../enums/main';
import { sign } from "jsonwebtoken"
import { JWT_SECRET } from "./../secrets/index"

const app = Router()

app.post("/register", async (req: Request, res: Response) => {
	try {
		const { email, password }: IAuthPayload = req.body

		if (!email) throw new ErrorException("Email is required.")
		if (!password) throw new ErrorException("Password is required.")

		const hashedPassword = await hashPassword(password)

		const insertResult = await insert({
			table: EDatabaseTables.USER,
			values: [email, hashedPassword, false]
		})
		
		/** Send email validation */
		await new Promise<void>((resolve, reject) => {
			sign(
				{
					email,
					id: insertResult.insertId
				},
				JWT_SECRET,
				async (err: Error, token: string) => {
					if (err) return reject(err)
					const url: string = `http://localhost:3000/confirmation/${token}`

					try {
						await sendValidationEmail(email, url)

						resolve()
					} catch (err) {
						reject(err)
					}
				}
			)
		})

		res.status(200).send({
			message: "You have successfully registered, please check your email for the validation link before signing in."
		})
	} catch (err) {
		respondError(res, err)
	}
})

export default app