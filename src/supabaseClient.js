// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// REPLACE THESE WITH YOUR ACTUAL SUPABASE KEYS
const supabaseUrl = 'https://ifqccwofrzajlifximqu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmcWNjd29mcnphamxpZnhpbXF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NDczNjcsImV4cCI6MjA4NDMyMzM2N30.ldYpq67z9E-6J8hA8_6CQ59PFzS9nYsLfCAsksg-Xj8';

export const supabase = createClient(supabaseUrl, supabaseKey);