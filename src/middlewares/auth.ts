import { Request, Response, NextFunction } from "express"
import { verify } from "jsonwebtoken"
import { ACCESS_TOKEN_SECRET } from "./../secrets/index"

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers["authorization"]
	const token = authHeader && authHeader.split(" ")[1]
	
	if (!token) return res.sendStatus(401)

	verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
		if (err) return res.sendStatus(403)
		
		req["body"]["user"] = user
		next()
	})
}