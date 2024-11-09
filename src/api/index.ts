import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://ggesmkfmwfepjibhkakh.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnZXNta2Ztd2ZlcGppYmhrYWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzExMjQ4MjEsImV4cCI6MjA0NjcwMDgyMX0.Uo2n8GEv5VU59tJMZmEhlH5CdyET22XPs5KdaKkEBaI";
export const supabase = createClient(supabaseUrl, supabaseKey);
