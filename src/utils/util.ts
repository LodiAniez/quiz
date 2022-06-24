import { config } from "dotenv"
import bcrypt from "bcrypt"
import { Response } from "express"
import { transport } from "./../configs/nodemailer"

config()

const SALTROUNDS: string | number = process.env.SALTROUND || 10

/**
 * 
 * @param password user's password
 * @returns hashed password
 */
export const hashPassword = async (
	password: string
): Promise<string> => {
	try {
		const hashedPassword = await bcrypt.hash(password, SALTROUNDS)

		return hashedPassword
	} catch (err) {
		throw err
	}
}

/**
 * 
 * @param hashedPassword the password fetched from database
 * @param plainPassword the password passed from the request payload
 * @returns a boolean, if encrypted and plain password does or does not match
 */
export const comparePassword = async (
	hashedPassword: string, 
	plainPassword: string
): Promise<boolean> => {
	try {
		const isEqual: boolean = await bcrypt.compare(plainPassword, hashedPassword)

		return isEqual
	} catch (err) {
		throw err
	}
}

/**
 * Custom ErrorException (throw new ErrorException)
 */
export class ErrorException extends Error {
	statusCode: number
	message: string
	data: any

	constructor(msg: string, code?: number, data?: any) {
		super(msg)

		if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ErrorException)
    }

		this.statusCode = code || null
		this.message = msg
		this.data = data
	}
}

export const respondError = (res: Response, err: Error): void => {
	res.status(500).send({
		message: err.message || "Internal Server Error.",
		status: false
	})
}

export const sendValidationEmail = async (email: string, url: string): Promise<boolean> => {
	try {
		await transport.sendMail({
			to: email,
			subject: "Confirm Email",
			html: `<p>Please confirm your email by clicking this <a href="${url}">link</a>.</p>`
		})

		return true
	} catch (err) {
		throw err
	}
}