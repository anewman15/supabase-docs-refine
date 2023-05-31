import { createClient } from "@refinedev/supabase";

const SUPABASE_URL = "https://shyoyrslbgxstrtwbuqi.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoeW95cnNsYmd4c3RydHdidXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODUwODI4NTAsImV4cCI6MjAwMDY1ODg1MH0.qlmYwwGIfLyHBQE_nZylOJox02_zMjr2-upCEJ-OqbA";

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  db: {
    schema: "public",
  },
  auth: {
    persistSession: true,
  },
});
