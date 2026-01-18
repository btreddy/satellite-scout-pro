// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// REPLACE THESE WITH YOUR ACTUAL SUPABASE KEYS
const supabaseUrl = 'sb_publishable_wvZQReYTE2f2afq0J9-a1g_0gl-pI5t';
const supabaseKey = 'your-anon-public-key';

export const supabase = createClient(supabaseUrl, supabaseKey);