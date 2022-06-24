import { Router, Request, Response } from "express"
import { respondError } from '../utils/util';
import { authenticateToken } from "./../middlewares/auth"

const app = Router()

app.use(authenticateToken)

app.get("/list", async (req: Request, res: Response) => {
	try {
		res.status(200).send({
			message: "List successfully fetched."
		})
	} catch (err) {
		respondError(res, err)
	}
})

export default app