import bcrypt from "bcryptjs";
import { pool, withTx } from "../../db/pool";
import { HttpError } from "../../utils/httpError";
import AppError from "../../errorHelpers/AppError";

// Never select the password column
const USER_COLUMNS =
  "id, name, email, age, role, is_active, created_at, updated_at";

interface CreateUserInput {
  name?: string;
  email?: string;
  password?: string;
  age?: number;
}

interface UpdateUserInput {
  name?: string;
  password?: string;
  age?: number;
  is_active?: boolean;
}

// Creates the user AND the wallet together (one transaction)
export const createUser = async (data: CreateUserInput, role = "user") => {
  const { name, email, password, age } = data;
  if (!email || !password)
    throw new HttpError(400, "email and password are required");

  const hashed = await bcrypt.hash(String(password), 10);

  return withTx(async (client) => {
    const created = await client.query(
      `INSERT INTO users (name, email, password, age, role)
       VALUES ($1,$2,$3,$4,$5) RETURNING ${USER_COLUMNS}`,
      [name ?? null, email, hashed, age ?? null, role],
    );
    await client.query(`INSERT INTO wallets (user_id) VALUES ($1)`, [
      created.rows[0].id,
    ]);
    return created.rows[0];
  });
};

export const getAllUsers = async () => {
  const result = await pool.query(
    `SELECT ${USER_COLUMNS} FROM users ORDER BY id`,
  );
  return result.rows;
};

export const getMeFromDB = async (email: string) => {
  const result = await pool.query(
    `SELECT id, name, email, role, is_active, created_at
     FROM users
     WHERE email=$1`,
    [email],
  );

  if (result.rowCount === 0) {
    throw new AppError(404, "User not found!!");
  }

  return result.rows[0];
};

export const getUserById = async (id: number) => {
  const result = await pool.query(
    `SELECT ${USER_COLUMNS} FROM users WHERE id=$1`,
    [id],
  );
  if (result.rowCount === 0) throw new HttpError(404, "User not found!!");
  return result.rows[0];
};

// Partial update: only the fields you send are changed (COALESCE keeps the old value)
export const updateUser = async (id: number, data: UpdateUserInput) => {
  const { name, password, age, is_active } = data;
  const hashed = password ? await bcrypt.hash(String(password), 10) : null;

  const result = await pool.query(
    `UPDATE users SET
       name = COALESCE($1, name),
       password = COALESCE($2, password),
       age = COALESCE($3, age),
       is_active = COALESCE($4, is_active),
       updated_at = NOW()
     WHERE id=$5
     RETURNING ${USER_COLUMNS}`,
    [name ?? null, hashed, age ?? null, is_active ?? null, id],
  );

  if (result.rowCount === 0) throw new HttpError(404, "User not found!!");
  return result.rows[0];
};

export const deleteUser = async (id: number) => {
  const result = await pool.query(`DELETE FROM users WHERE id=$1`, [id]);
  if (result.rowCount === 0) throw new HttpError(404, "User not found!!");
};
