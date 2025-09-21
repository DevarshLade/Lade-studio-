# Supabase SQL Scripts

This directory contains SQL scripts to fix common issues with the Supabase database setup.

## Scripts

### [corrected-orders-fix.sql](file:///c:/Coding/e-com/Lade-Studio/supabase/corrected-orders-fix.sql)

This script fixes Row Level Security (RLS) policies on the orders table. It should be used to resolve the "Failed to create order: new row violates row-level security policy for table 'order'" error.

**Usage:**
1. Copy the contents of this file
2. Go to your Supabase project dashboard
3. Navigate to SQL Editor
4. Paste the script and run it

### [simple-orders-fix.sql](file:///c:/Coding/e-com/Lade-Studio/supabase/simple-orders-fix.sql)

A simpler version of the orders fix script. Use this if the corrected version doesn't work.

### [fix-orders-rls.sql](file:///c:/Coding/e-com/Lade-Studio/supabase/fix-orders-rls.sql)

The original fix script. This may contain errors and is kept for reference.

## Migrations

The [migrations](file:///c:/Coding/e-com/Lade-Studio/supabase/migrations/) directory contains migration scripts that are applied automatically by Supabase.

### [013_fix_auth_triggers.sql](file:///c:/Coding/e-com/Lade-Studio/supabase/migrations/013_fix_auth_triggers.sql)

This migration addresses common application-level issues that can cause auth problems.

## Troubleshooting

If you encounter errors when running these scripts:

1. Make sure you're running them in the correct Supabase project
2. Check that all required tables exist
3. Verify you have the necessary permissions to run DDL commands
4. Check the Supabase logs for more detailed error information