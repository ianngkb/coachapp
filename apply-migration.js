const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function applyMigration() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (\!supabaseUrl || \!serviceRoleKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Read the migration file
    const migrationPath = path.join(__dirname, "supabase", "migrations", "20240916120000_split_names_phone_validation.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    console.log("Applying migration...");

    // Execute raw SQL
    const { data, error } = await supabase.rpc("exec", { sql: migrationSQL });

    if (error) {
      console.error("Migration failed:", error);
    } else {
      console.log("Migration applied successfully\!");

      // Test the changes by querying the users table
      const { data: users, error: queryError } = await supabase
        .from("users")
        .select("first_name, last_name, phone_number")
        .limit(5);

      if (queryError) {
        console.error("Query error:", queryError);
      } else {
        console.log("Sample users after migration:");
        console.log(users);
      }
    }

  } catch (err) {
    console.error("Error:", err.message);
  }
}

applyMigration();
