-- Migration: 05_FIX_RLS_POLICIES.sql
-- Goal: Ensure robust RLS policies for Admins/Managers and define missing helper functions.

-- 1. Create or Replace Helper Functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_privileged() -- Unified check for ADMIN or MANAGER
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Repair Users table policies (Fixing the is_admin bug from 04)
DROP POLICY IF EXISTS "Users: Admins Update All" ON users;
CREATE POLICY "Users: Admins Update All" ON users FOR UPDATE
USING ( is_privileged() )
WITH CHECK ( is_privileged() );

-- 3. Repair Vendors table policies
-- Use explicit policies for each action to be more reliable
DROP POLICY IF EXISTS "Vendors: Admin Manage" ON public.vendors;
DROP POLICY IF EXISTS "Vendors: Admin Insert" ON public.vendors;
DROP POLICY IF EXISTS "Vendors: Admin Update" ON public.vendors;
DROP POLICY IF EXISTS "Vendors: Admin Delete" ON public.vendors;

CREATE POLICY "Vendors: Admin Insert" ON public.vendors FOR INSERT WITH CHECK ( is_privileged() );
CREATE POLICY "Vendors: Admin Update" ON public.vendors FOR UPDATE USING ( is_privileged() ) WITH CHECK ( is_privileged() );
CREATE POLICY "Vendors: Admin Delete" ON public.vendors FOR DELETE USING ( is_privileged() );
CREATE POLICY "Vendors: Admin Select" ON public.vendors FOR SELECT USING ( is_privileged() OR true ); -- true for staff view policy below

-- 4. Repair Services table policies
DROP POLICY IF EXISTS "Services: Admin Edit" ON public.services;
DROP POLICY IF EXISTS "Services: Admin Manage" ON public.services;

CREATE POLICY "Services: Admin Manage" ON public.services FOR ALL USING ( is_privileged() ) WITH CHECK ( is_privileged() );

-- 5. Repair Jobs table policies
DROP POLICY IF EXISTS "Jobs: Admin Manage All" ON public.jobs;
CREATE POLICY "Jobs: Admin Manage All" ON public.jobs FOR ALL USING ( is_privileged() ) WITH CHECK ( is_privileged() );
