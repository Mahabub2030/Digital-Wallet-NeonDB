import { pool } from "./pool";

// Creates all tables if they do not exist yet. Runs on every server start.
export const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      age INT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Role column (also adds it to an old users table that already exists)
  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';
  `);

  // Database-level guarantee: only ONE super_admin can ever exist
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS only_one_super_admin
    ON users (role) WHERE role = 'super_admin';
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS wallets(
      id SERIAL PRIMARY KEY,
      user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      balance NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
      currency VARCHAR(3) NOT NULL DEFAULT 'SAR',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions(
      id SERIAL PRIMARY KEY,
      type VARCHAR(20) NOT NULL CHECK (type IN ('deposit','withdraw','transfer')),
      from_wallet_id INT REFERENCES wallets(id) ON DELETE SET NULL,
      to_wallet_id INT REFERENCES wallets(id) ON DELETE SET NULL,
      amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
      note TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log("Neon database connected & tables ready!!");
};
