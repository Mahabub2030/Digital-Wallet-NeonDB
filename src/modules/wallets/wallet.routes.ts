import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as controller from "./wallet.controller";

const router = Router();

router.post("/transfer", asyncHandler(controller.transfer));
router.get("/:userId", asyncHandler(controller.getWallet));
router.post("/:userId/deposit", asyncHandler(controller.deposit));
router.post("/:userId/withdraw", asyncHandler(controller.withdraw));
router.get("/:userId/transactions", asyncHandler(controller.getTransactions));

export default router;
