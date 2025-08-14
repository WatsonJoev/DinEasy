// supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kdxafujzyofzrqndfuhg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkeGFmdWp6eW9menJxbmRmdWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMzI4NTEsImV4cCI6MjA2NTkwODg1MX0.q-yDQtXxWzvQyUuf0GIxqug6X0-BCOV8qM8ECfD3kos'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
