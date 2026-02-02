-- Supabase Row Level Security (RLS) Policies for CSR Tracker
-- Run these in your Supabase SQL Editor after setting up Prisma migrations

-- Enable RLS on tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy: Employees can only read their own record
CREATE POLICY "employees_select_own" ON employees
  FOR SELECT
  USING (user_id = auth.uid()::text);

-- Policy: Allow insert for authenticated users (creating their employee record)
CREATE POLICY "employees_insert_own" ON employees
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- Policy: Employees can update their own record
CREATE POLICY "employees_update_own" ON employees
  FOR UPDATE
  USING (user_id = auth.uid()::text);

-- Policy: Leads - employees can only see their own leads
CREATE POLICY "leads_select_own" ON leads
  FOR SELECT
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()::text
    )
  );

-- Policy: Leads - employees can insert their own leads
CREATE POLICY "leads_insert_own" ON leads
  FOR INSERT
  WITH CHECK (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()::text
    )
  );

-- Policy: Leads - employees can update their own leads
CREATE POLICY "leads_update_own" ON leads
  FOR UPDATE
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()::text
    )
  );

-- Policy: Leads - employees can delete their own leads
CREATE POLICY "leads_delete_own" ON leads
  FOR DELETE
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()::text
    )
  );

-- Grant usage on schema to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Note: The service role key used by Prisma bypasses RLS
-- This allows server-side code to perform admin operations
