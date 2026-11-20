import { Router } from "express";
import userRoutes from "../modules/users/user.routes";
import walletRoutes from "../modules/wallets/wallet.routes";

// All API routes live under /api/v1 (see app.ts)
const router = Router();
console.log('this is the')
router.use("/users", userRoutes);
router.use("/wallets", walletRoutes);

export default router;
