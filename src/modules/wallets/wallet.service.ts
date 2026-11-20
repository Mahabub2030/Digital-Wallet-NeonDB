import { pool, withTx } from "../../db/pool";
import { HttpError } from "../../utils/httpError";

export const getWallet = async (userId: number) => {
  const result = await pool.query(`SELECT * FROM wallets WHERE user_id=$1`, [userId]);
  if (result.rowCount === 0) throw new HttpError(404, "Wallet not found!!");
  return result.rows[0];
};

export const deposit = async (userId: number, amount: number, note: string | null) => {
  return withTx(async (client) => {
    const updated = await client.query(
      `UPDATE wallets SET balance = balance + $1, updated_at = NOW()
       WHERE user_id=$2 RETURNING *`,
      [amount, userId],
    );
    if (updated.rowCount === 0) throw new HttpError(404, "Wallet not found!!");

    await client.query(
      `INSERT INTO transactions (type, to_wallet_id, amount, note)
       VALUES ('deposit',$1,$2,$3)`,
      [updated.rows[0].id, amount, note],
    );
    return updated.rows[0];
  });
};

export const withdraw = async (userId: number, amount: number, note: string | null) => {
  return withTx(async (client) => {
    // balance >= amount check happens inside the UPDATE, so it is race-safe
    const updated = await client.query(
      `UPDATE wallets SET balance = balance - $1, updated_at = NOW()
       WHERE user_id=$2 AND balance >= $1 RETURNING *`,
      [amount, userId],
    );

    if (updated.rowCount === 0) {
      const exists = await client.query(`SELECT 1 FROM wallets WHERE user_id=$1`, [userId]);
      if (exists.rowCount === 0) throw new HttpError(404, "Wallet not found!!");
      throw new HttpError(400, "Insufficient balance");
    }

    await client.query(
      `INSERT INTO transactions (type, from_wallet_id, amount, note)
       VALUES ('withdraw',$1,$2,$3)`,
      [updated.rows[0].id, amount, note],
    );
    return updated.rows[0];
  });
};

export const transfer = async (
  fromUserId: number,
  toUserId: number,
  amount: number,
  note: string | null,
) => {
  if (fromUserId === toUserId) {
    throw new HttpError(400, "Cannot transfer to the same wallet");
  }

  return withTx(async (client) => {
    // Lock both wallets in id order (prevents deadlocks)
    const locked = await client.query(
      `SELECT id, user_id FROM wallets
       WHERE user_id = ANY($1::int[]) ORDER BY id FOR UPDATE`,
      [[fromUserId, toUserId]],
    );
    if (locked.rowCount !== 2) throw new HttpError(404, "Sender or receiver wallet not found!!");

    const debit = await client.query(
      `UPDATE wallets SET balance = balance - $1, updated_at = NOW()
       WHERE user_id=$2 AND balance >= $1 RETURNING *`,
      [amount, fromUserId],
    );
    if (debit.rowCount === 0) throw new HttpError(400, "Insufficient balance");

    const credit = await client.query(
      `UPDATE wallets SET balance = balance + $1, updated_at = NOW()
       WHERE user_id=$2 RETURNING *`,
      [amount, toUserId],
    );

    const tx = await client.query(
      `INSERT INTO transactions (type, from_wallet_id, to_wallet_id, amount, note)
       VALUES ('transfer',$1,$2,$3,$4) RETURNING *`,
      [debit.rows[0].id, credit.rows[0].id, amount, note],
    );

    return { transaction: tx.rows[0], from_wallet: debit.rows[0], to_wallet: credit.rows[0] };
  });
};

export const getTransactions = async (userId: number) => {
  const wallet = await pool.query(`SELECT id FROM wallets WHERE user_id=$1`, [userId]);
  if (wallet.rowCount === 0) throw new HttpError(404, "Wallet not found!!");

  const walletId = wallet.rows[0].id;
  const result = await pool.query(
    `SELECT * FROM transactions
     WHERE from_wallet_id=$1 OR to_wallet_id=$1
     ORDER BY created_at DESC, id DESC`,
    [walletId],
  );
  return result.rows;
};
