import type { NextFunction, Request, Response } from "express";
import { authService } from "./auth.service";
import sendResponse from "../../utils/sencResponse";
import { setAuthCookie } from "../../utils/setCookie";
// const loginUser = async (req: Request, res: Response) => {
//   try {
//     const result = await authService.loginUserIntoDB(req.body);

//     const { refreshToken } = result;

//     res.cookie("refreshToken", refreshToken, {
//       secure: true, // http -> false , https -> true / In Production -> true
//       httpOnly: true, // Prevent XSS attack
//       sameSite: "lax", // "none" , "strict", "lax" -> CSRF
//       // maxAge
//       path: "/",
//       domain: "localhost", // .example.com
//     });

//     sendResponse(res, {
//       statusCode: 200,
//       success: true,
//       message: "User login successfully!",
//       data: result,
//     });
//   } catch (error: any) {
//     sendResponse(res, {
//       statusCode: 500,
//       success: false,
//       message: error?.message,
//       error: error,
//     });
//   }
// };
const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);

    const { accessToken, refreshToken, ...rest } = result;

    // Sets BOTH accessToken and refreshToken cookies
    setAuthCookie(res, { accessToken, refreshToken });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User login successfully!",
      data: {
        accessToken, // keep this if your frontend also sends it in the Authorization header
        ...rest, // user info etc. (refreshToken stays only in the httpOnly cookie)
      },
    });
  } catch (error) {
    next(error); // let the global error handler send the correct status (401, 404, etc.)
  }
};
// const logOutUser = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     res.clearCookie("accessToken", {
//       httpOnly: true,
//       secure: true,
//       sameSite: "none",
//     });
//     res.clearCookie("refreshToken", {
//       httpOnly: true,
//       secure: true,
//       sameSite: "none",
//     });
//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: "User logged out successfully",
//       data: null,
//     });
//   },
// );
const logOutUser = async (req: Request, res: Response) => {
  try {
    // Optional: invalidate the refresh token on the server too
    // const { refreshToken } = req.cookies;
    // if (refreshToken) {
    //   await authService.logoutUserFromDB(refreshToken);
    // }

    res.clearCookie("refreshToken", {
      secure: false, // must match login (true in production)
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      domain: "localhost", // must match login
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User logged out successfully!",
      data: null,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error?.message,
      error: error,
    });
  }
};
const generateToken = async (req: Request, res: Response) => {
  try {
    // console.log(req.cookies.refreshToken);
    const result = await authService.generateAccessToken(
      req.cookies.refreshToken,
    );

    res.status(200).json({
      success: true,
      message: "Access token generated successfully!",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message,
      error: error,
    });
  }
};

export const authController = {
  loginUser,
  logOutUser,
  generateToken,
};
