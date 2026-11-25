import { CookieOptions, Response } from "express";
import config from "../config";

export interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
}

const isProd = config.NODE_ENV === "production";

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd, // true on HTTPS (production), false on http://localhost
  sameSite: isProd ? "none" : "lax", // "none" allows a cross-domain frontend in production
  path: "/",
};

const ACCESS_TOKEN_MAX_AGE = 24 * 60 * 60 * 1000; // 1 day
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

export const setAuthCookie = (res: Response, tokenInfo: AuthTokens) => {
  if (tokenInfo.accessToken) {
    res.cookie("accessToken", tokenInfo.accessToken, {
      ...baseCookieOptions,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });
  }

  if (tokenInfo.refreshToken) {
    res.cookie("refreshToken", tokenInfo.refreshToken, {
      ...baseCookieOptions,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
  }
};

// Use this in your logout controller
export const clearAuthCookie = (res: Response) => {
  res.clearCookie("accessToken", baseCookieOptions);
  res.clearCookie("refreshToken", baseCookieOptions);
};
