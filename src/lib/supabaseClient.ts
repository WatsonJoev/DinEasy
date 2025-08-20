import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iolwsvwmtctsyzufbfio.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbHdzdndtdGN0c3l6dWZiZmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMzc3MzEsImV4cCI6MjA2NTkxMzczMX0.X4_53D6JbePyfqJHPvKExdKkRM_j635H1yzT_DoRYRw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
