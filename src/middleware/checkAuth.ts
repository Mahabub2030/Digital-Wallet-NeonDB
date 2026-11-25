import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db/pool";
import AppError from "../errorHelpers/AppError";

const INVALID_TOKEN_VALUES = new Set(["", "null", "undefined"]);

function extractToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization?.trim();

  if (authHeader) {
    const raw = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : authHeader;

    if (!INVALID_TOKEN_VALUES.has(raw)) {
      return raw;
    }
  }

  const cookieToken = req.cookies?.accessToken;
  if (typeof cookieToken === "string") {
    const cleaned = cookieToken.trim();
    if (!INVALID_TOKEN_VALUES.has(cleaned)) {
      return cleaned;
    }
  }

  return undefined;
}

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = extractToken(req);

      if (!token) {
        throw new AppError(401, "No token received!!");
      }
      const secret = config.JWT.jwt_secret;
      if (!secret) {
        throw new AppError(500, "JWT secret is not configured!!");
      }
      let verifiedToken: JwtPayload;
      try {
        const decoded = jwt.verify(token, secret);
        if (typeof decoded !== "object" || decoded === null) {
          throw new AppError(401, "Invalid token payload!!");
        }
        verifiedToken = decoded as JwtPayload;
      } catch (err) {
        if (err instanceof AppError) throw err;
        throw new AppError(401, "Invalid or expired token!!");
      }

      if (!verifiedToken.email) {
        throw new AppError(401, "Invalid token payload: missing email!!");
      }

      const result = await pool.query(
        `SELECT id, name, email, role, is_active FROM users WHERE email = $1`,
        [verifiedToken.email],
      );

      if (result.rowCount === 0) {
        throw new AppError(404, "User does not exist!!");
      }

      const dbUser = result.rows[0];

      if (!dbUser.is_active) {
        throw new AppError(403, "User is not active!!");
      }

      // If authRoles is empty, any active logged-in user is allowed
      if (authRoles.length > 0 && !authRoles.includes(dbUser.role)) {
        throw new AppError(403, "You are not permitted to view this route!!");
      }

      req.user = {
        ...verifiedToken,
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
