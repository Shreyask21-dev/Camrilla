// migrations/run-migrations.js

import fs from "fs";
import path from "path";
import db from "../../lib/db"; // database pool

export async function runMigration() {
  try {
    // Full path to SQL file
    const sqlPath = path.join(process.cwd(), "create_tables.sql");

    // Read SQL file
    const sql = fs.readFileSync(sqlPath, "utf8");

    // Split SQL by semicolon — prevents empty statements
    const statements = sql
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    console.log("🚀 Starting SQL migration...");
    console.log("---------------------------------------");

    // Execute each SQL statement
    for (const statement of statements) {
      const preview = statement.substring(0, 100).replace(/\s+/g, " ");
      console.log("Executing:", preview + "...");

      await db.execute(statement); // ← uses your pool correctly
    }

    console.log("---------------------------------------");
    console.log("✅ Migration completed successfully");

    return {
      success: true,
      message: "Migration executed completely",
    };

  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}
