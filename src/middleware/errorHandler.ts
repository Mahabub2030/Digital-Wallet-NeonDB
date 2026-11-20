import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/httpError";

export const notFound = (_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
};

// Express recognises an error handler by its 4 parameters
export const errorHandler = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof HttpError) {
    return res.status(error.status).json({ success: false, message: error.message });
  }
  if (error?.code === "23505") {
    return res.status(409).json({ success: false, message: "Email already exists!!" });
  }
  console.error(error);
  return res.status(500).json({ success: false, message: "Internal server error" });
};
