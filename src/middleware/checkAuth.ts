import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db/pool";
import AppError from "../errorHelpers/AppError";

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Accept "Bearer <token>", a raw token, or an accessToken cookie
      let token = req.headers.authorization || req.cookies?.accessToken;

      if (!token) {
        throw new AppError(401, "No token received!!");
      }

      if (token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
      }

      let verifiedToken: JwtPayload;
      try {
        verifiedToken = jwt.verify(
          token,
          config.JWT.jwt_secret as string,
        ) as JwtPayload;
      } catch {
        throw new AppError(401, "Invalid or expired token!!");
      }

      const user = await pool.query(
        `SELECT id, name, email, role, is_active FROM users WHERE email=$1`,
        [verifiedToken.email],
      );

      if (user.rowCount === 0) {
        throw new AppError(404, "User does not exist!!");
      }

      if (!user.rows[0].is_active) {
        throw new AppError(403, "User is not active!!");
      }

      // If authRoles is empty, any logged-in user is allowed
      if (authRoles.length && !authRoles.includes(user.rows[0].role)) {
        throw new AppError(403, "You are not permitted to view this route!!");
      }

      req.user = verifiedToken;
      next();
    } catch (error) {
      next(error);
    }
  };
