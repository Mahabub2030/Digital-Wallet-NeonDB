import type { NextFunction, Request, Response } from "express";

// Wraps an async controller so any error goes to the error middleware
export const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
