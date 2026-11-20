import type { Request, Response } from "express";
import { parseAmount, parseId } from "../../utils/validators";
import * as walletService from "./wallet.service";

export const getWallet = async (req: Request, res: Response) => {
  const wallet = await walletService.getWallet(parseId(req.params.userId, "userId"));
  res.status(200).json({
    success: true,
    message: "Wallet retrieved successfully!",
    data: wallet,
  });
};

export const deposit = async (req: Request, res: Response) => {
  const wallet = await walletService.deposit(
    parseId(req.params.userId, "userId"),
    parseAmount(req.body.amount),
    req.body.note ?? null,
  );
  res.status(200).json({ success: true, message: "Deposit successful!", data: wallet });
};

export const withdraw = async (req: Request, res: Response) => {
  const wallet = await walletService.withdraw(
    parseId(req.params.userId, "userId"),
    parseAmount(req.body.amount),
    req.body.note ?? null,
  );
  res.status(200).json({ success: true, message: "Withdraw successful!", data: wallet });
};

export const transfer = async (req: Request, res: Response) => {
  const result = await walletService.transfer(
    parseId(req.body.fromUserId, "fromUserId"),
    parseId(req.body.toUserId, "toUserId"),
    parseAmount(req.body.amount),
    req.body.note ?? null,
  );
  res.status(200).json({ success: true, message: "Transfer successful!", data: result });
};

export const getTransactions = async (req: Request, res: Response) => {
  const transactions = await walletService.getTransactions(
    parseId(req.params.userId, "userId"),
  );
  res.status(200).json({
    success: true,
    message: "Transactions retrieved successfully!",
    data: transactions,
  });
};
