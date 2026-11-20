import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import routes from "./routes";
import { authRoute } from "./modules/auth/auth.route";
const app: Application = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Digital Wallet API (Neon) is running",
  });
});
app.use("/api/v1", routes);
app.use("/api/v1/auth", authRoute);
// ---------- helpers ----------
class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export default app;
