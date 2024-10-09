import { ErrorRequestHandler } from "express";
import { HttpError } from "../errors/HttpError";

export const errorHandlerMiddleware: ErrorRequestHandler = (error, req, res, next) => {
  // error ocurred when request fails
  if (error instanceof HttpError) {
    res.status(error.status).json({ message: error.message })
  } else if (error instanceof Error) { // error JS
    res.status(500).json({ message: error.message })
  } else { // default server error
    res.status(500).json({ message: "some unknown error occurred in the server" })
  }
}