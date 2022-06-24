import { Router, Response, Request } from "express"
import { respondError, ErrorException, hashPassword, sendValidationEmail, comparePassword, generateToken, deserializeToken, saveToCache, validateRefreshToken, removeFromCache } from '../utils/util';
import { IAuthPayload } from '../models/api-payload';
import { insert, select, update } from '../utils/query';
import { EDatabaseTables } from '../enums/main';
import { sign } from "jsonwebtoken"
import { EMAIL_TOKEN_SECRET } from "./../secrets/index"

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
				EMAIL_TOKEN_SECRET,
				async (err: Error, token: string) => {
					if (err) return reject(err)
					const url: string = `http://localhost:3000/auth/confirmation/${token}`

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

app.post("/logout", async (req: Request, res: Response) => {
	try {
		const { token }: {
			token?: string;
		} = req.body

		if (!token) return res.status(500).send({
			message: "Token is required."
		})

		const deserializedUser = deserializeToken(token, "refresh")
		removeFromCache(deserializedUser?.email)

		res.status(200).send({
			message: "You are successfully logged out from the system."
		})
	} catch (err) {
		respondError(res, err)
	}
})

app.post("/login", async (req: Request, res: Response) => {
	try {
		const { email, password }: IAuthPayload = req.body

		if (!email) throw new ErrorException("Email is required.")
		if (!password) throw new ErrorException("Password is required.")

		const [result] = await select({
			table: EDatabaseTables.USER,
			references: [
				{ 
					key: "email",
					value: email 
				}
			]
		})

		const hashedPassword: string | null = result && result.password ? result.password : null

		const isPasswordCorrect: boolean = await comparePassword(hashedPassword, password)

		/** Check if the password does matched with the hashed password from the database */
		if (!isPasswordCorrect) return res.status(401).send({
			message: "Your username or password is invalid."
		})

		/** Check if the account is validated */
		if (!result?.validated) return res.status(403).send({
			message: "Please confirm your email first by clicking the link sent to your email before logging in."
		})

		/** A valid access, generate access and refresh token here */
		const user = { email }

		const accessToken: string = generateToken("access", user)
		const refreshToken: string = generateToken("refresh", user)

		/** Save refresh token to cache so we can revoke it later when the user logs out from the system */
		saveToCache(email, { refreshToken })

		res.status(200).send({
			message: "You are successfully logged in.",
			data: {
				accessToken, refreshToken
			}
		})
	} catch (err) {
		respondError(res, err)
	}
})

app.get("/confirmation/:token", async (req: Request, res: Response) => {
	try {
		const { token }: { token?: string } = req.params

		if (!token) return res.status(403).send({
			message: "Token is invalid."
		})

		const serializedUser = deserializeToken(token, "email")
		await update({
			table: EDatabaseTables.USER,
			id: serializedUser?.id,
			references: [
				{
					key: "validated",
					value: true
				}
			]
		})

		res.status(200).send({
			message: "Email is successfully confirmed."
		})
	} catch (err) {
		respondError(res, err)
	}
})

/**
 * 
 * Value to be passed in the payload is the refresh token
 */
app.post("/token", (req: Request, res: Response) => {
	try {
		const { token }: {
			token?: string
		} = req.body
		console.log(!token)
		if (!token) return res.status(403).send({
			message: "Token is invalid."
		})

		const deserializedUser = deserializeToken(token, "refresh")
		
		const isTokenValid = validateRefreshToken(deserializedUser?.email, token)

		if (!isTokenValid) return res.status(403).send({
			message: "Provided token is not valid."
		})

		const accessToken = generateToken("access", { email: deserializedUser?.email || null })

		res.status(200).send({
			message: "New access token is generated.",
			data: {
				accessToken
			}
		})
	} catch (err) {
		respondError(res, err)
	}
})

export default app