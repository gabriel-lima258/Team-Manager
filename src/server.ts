import express from "express";
import cors from "cors";
import { errorHandlerMiddleware } from "./middlewares/error-handler";
import { router } from "./routes/router";

const app = express();

app.use(cors());
app.use(express.json()); // read the request body
app.use('/api', router)
app.use(errorHandlerMiddleware)

const PORT = process.env.PORT || 3333
app.listen(PORT, () => {
  console.log("running on port " + PORT);
});