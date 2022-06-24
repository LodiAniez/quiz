import express, { Express } from "express"
import cors from "cors"
import { route } from './middlewares/ext-route';
import { PORT } from "./secrets/index"

const app: Express = express()

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

route(app)

const port: string | number = PORT || 8080

app.listen(port, () => console.log(`Server is running on port ${port}.`))