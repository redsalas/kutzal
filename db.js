import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);

// Test the connection
supabase
  .from("reservations")
  .select("*")
  .limit(1)
  .then(({ data, error }) => {
    if (error) console.error("Connection error:", error);
    else console.log("Connected:", data);
  });

export default supabase;
