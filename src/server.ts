import app from "./app";
import config from "./config";
import { initDB } from "./db/init";


import { seedSuperAdmin } from "./seed/superAdmin";

// Start order: connect to Neon -> create tables -> seed super admin -> listen
const start = async () => {
  try {
    await initDB();
    await seedSuperAdmin();

    app.listen(config.port, () => {
      console.log(`The Express server is running on the port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();
