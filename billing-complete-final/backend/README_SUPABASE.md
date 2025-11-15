# Supabase Integration Guide

1. Create a Supabase account and project.
2. Create tables matching `products`, `bills`, `bill_items`, and `users`.
3. Configure API keys and RLS as needed.
4. In your backend, use `@supabase/supabase-js` or direct REST calls to sync data.
5. Example (node) to insert product:

const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
const { data, error } = await supabase.from('products').upsert({...product, name: product.name})
