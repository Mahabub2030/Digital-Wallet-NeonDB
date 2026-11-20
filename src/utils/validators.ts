import { HttpError } from "./httpError";

export const parseId = (value: unknown, label = "id"): number => {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, `Invalid ${label}`);
  return n;
};

// Amount must be positive with max 2 decimals
export const parseAmount = (value: unknown): number => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0 || Math.round(n * 100) / 100 !== n) {
    throw new HttpError(400, "amount must be a positive number with max 2 decimals");
  }
  return n;
};
