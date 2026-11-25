import dotenv from "dotenv";

dotenv.config();

const config = {
  port: Number(process.env.PORT) || 5000,
  connection_string: process.env.DATABASE_URL as string,
  FRONTEND_URL: process.env.FRONTEND_URL as string,
  NODE_ENV: process.env.NODE_ENV as "development" | "production",
  super_admin: {
    name: process.env.SUPER_ADMIN_NAME || "Super Admin",
    email: process.env.SUPER_ADMIN_EMAIL as string,
    password: process.env.SUPER_ADMIN_PASSWORD as string,
  },
  JWT: {
    jwt_secret: process.env.JWT_ACCESS_SECRET as string,
    refresh_secret: process.env.JWT_REFRESH_SECRET as string,
  },
  // PASSPORT_GOOGLE: {},
  // REDIS:{}
  // CLOUDINARY:{}
};

if (!config.connection_string) {
  throw new Error(
    "DATABASE_URL is missing. Add your Neon connection string to .env",
  );
}

export default config;
