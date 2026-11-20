import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as controller from "./user.controller";

const router = Router();

router.post("/create", asyncHandler(controller.createUser));
router.get("/", asyncHandler(controller.getAllUsers));
router.get("/:id", asyncHandler(controller.getUserById));
router.put("/:id", asyncHandler(controller.updateUser));
router.delete("/:id", asyncHandler(controller.deleteUser));

export default router;
