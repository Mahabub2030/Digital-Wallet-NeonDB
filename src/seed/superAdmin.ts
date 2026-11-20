import config from "../config";
import { pool } from "../db/pool";
import { createUser } from "../modules/users/user.service";

// Runs every time the server starts, but only creates the super admin ONE time.
export const seedSuperAdmin = async () => {
  const { name, email, password } = config.super_admin;

  // 1. Already have a super admin? Then do nothing.
  const existing = await pool.query(
    `SELECT id, email FROM users WHERE role = 'super_admin' LIMIT 1`,
  );
  if (existing.rowCount && existing.rowCount > 0) {
    console.log(`Super admin already exists!! (${existing.rows[0].email})`);
    return;
  }

  // 2. Email already used by a normal user? Do not touch that account.
  const emailUsed = await pool.query(`SELECT id FROM users WHERE email = $1`, [
    email,
  ]);
  if (emailUsed.rowCount && emailUsed.rowCount > 0) {
    console.log(
      `Cannot create super admin: ${email} is already used by a normal user. ` +
        `Change SUPER_ADMIN_EMAIL in .env`,
    );
    return;
  }

  // 3. Create super admin + wallet together
  try {
    await createUser({ name, email, password }, "super_admin");
    console.log(`Super admin created!! (${email})`);
  } catch (error: any) {
    // 23505 = unique violation (another server instance created it at the same moment)
    if (error?.code === "23505") {
      console.log("Super admin already exists!!");
      return;
    }
    throw error;
  }
};
