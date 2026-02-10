-- Migration: 04_FIX_USER_RLS_UPDATE.sql
-- Goal: Allow Admins to update user profiles in the 'users' table.

DROP POLICY IF EXISTS "Users: Admins Update All" ON users;
CREATE POLICY "Users: Admins Update All" ON users FOR UPDATE
USING ( is_admin() )
WITH CHECK ( is_admin() );

-- Also allow users to update their own basic info (if needed)
DROP POLICY IF EXISTS "Users: Update Self" ON users;
CREATE POLICY "Users: Update Self" ON users FOR UPDATE
USING ( auth.uid() = id )
WITH CHECK ( auth.uid() = id );
