import { Pool, type PoolClient } from "pg";
import config from "../config";

// Neon requires SSL. The connection string already has sslmode.
export const pool = new Pool({
  connectionString: config.connection_string,
  ssl: { rejectUnauthorized: false },
});

// Run several queries as one all-or-nothing unit (needed for money moves)
export async function withTx<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
