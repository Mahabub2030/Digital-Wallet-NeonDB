import type { Request, Response } from "express";
import { parseId } from "../../utils/validators";
import * as userService from "./user.service";

// Controller = read the request, call the service, send the response.

export const createUser = async (req: Request, res: Response) => {
  // role is never taken from the request, so nobody can make themselves admin
  const user = await userService.createUser(req.body);
  res
    .status(201)
    .json({ success: true, message: "User created!!", data: user });
};

export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await userService.getAllUsers();
  res.status(200).json({
    success: true,
    message: "Users retrieved successfully!",
    data: users,
  });
};

export const getUserById = async (req: Request, res: Response) => {
  const user = await userService.getUserById(parseId(req.params.id));
  res.status(200).json({
    success: true,
    message: "User retrieved successfully!",
    data: user,
  });
};

export const updateUser = async (req: Request, res: Response) => {
  const user = await userService.updateUser(parseId(req.params.id), req.body);
  res.status(200).json({
    success: true,
    message: "User updated successfully!",
    data: user,
  });
};

export const deleteUser = async (req: Request, res: Response) => {
  await userService.deleteUser(parseId(req.params.id));
  res
    .status(200)
    .json({ success: true, message: "User deleted successfully!" });
};
