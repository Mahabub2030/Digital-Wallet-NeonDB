import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import routes from "./routes";
import { authRoute } from "./modules/auth/auth.route";
import config from "./config";
import cookieParser from "cookie-parser";
const app: Application = express();

const allowedOrigins = [
  config.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5173",
].filter((origin): origin is string => Boolean(origin));

// 1. CORS must come BEFORE routes so preflight (OPTIONS) and responses get headers
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// 2. Body parsers
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Routes
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
