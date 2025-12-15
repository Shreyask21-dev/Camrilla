// src/app/api/run-migration/route.js
import { NextResponse } from "next/server";
import { runMigration } from "../../../../migrations/run-migrations.js"; 
// ⬆️ This path is 100% correct for your folder structure

export async function POST(request) {
  try {
    const MIGRATION_SECRET = process.env.MIGRATION_SECRET;

    const headerSecret = request.headers.get("x-migration-secret");
    let bodySecret = null;

    try {
      const body = await request.json().catch(() => ({}));
      bodySecret = body.secret;
    } catch {}

    // Security check
    if (
      !MIGRATION_SECRET ||
      (headerSecret !== MIGRATION_SECRET && bodySecret !== MIGRATION_SECRET)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await runMigration();

    return NextResponse.json(result);
  } catch (err) {
    console.error("Migration error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
