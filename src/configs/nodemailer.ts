import { createTransport } from "nodemailer"
import { EMAIL_USERNAME, EMAIL_PASSWORD } from "./../secrets/index"

export const transport = createTransport({
	service: "GMail",
	auth: {
		user: EMAIL_USERNAME,
		pass: EMAIL_PASSWORD
	}
})