/*
  # Initial Database Schema for Servly Platform

  1. New Tables
    - `users` - User accounts and subscription info
    - `employees` - Employee management for HR system
    - `websites` - Website builder projects
    - `loyalty_programs` - Loyalty system configurations
    - `customers` - Customer data for loyalty system
    - `attendance` - Employee attendance tracking
    - `payroll` - Salary and payment records

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  company_name text,
  phone text,
  subscription_plan text DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'professional', 'enterprise')),
  subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
  subscription_expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  position text,
  department text,
  salary decimal(10,2),
  hire_date date,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  check_in timestamptz,
  check_out timestamptz,
  break_duration interval DEFAULT '0 minutes',
  total_hours decimal(4,2),
  status text DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day')),
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- Payroll table
CREATE TABLE IF NOT EXISTS payroll (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  pay_period_start date NOT NULL,
  pay_period_end date NOT NULL,
  base_salary decimal(10,2) NOT NULL,
  overtime_hours decimal(4,2) DEFAULT 0,
  overtime_rate decimal(10,2) DEFAULT 0,
  bonuses decimal(10,2) DEFAULT 0,
  deductions decimal(10,2) DEFAULT 0,
  gross_pay decimal(10,2) NOT NULL,
  net_pay decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Websites table
CREATE TABLE IF NOT EXISTS websites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  domain text,
  custom_domain text,
  template text,
  status text DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'maintenance')),
  content jsonb DEFAULT '{}',
  seo_settings jsonb DEFAULT '{}',
  analytics_data jsonb DEFAULT '{}',
  last_published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Loyalty Programs table
CREATE TABLE IF NOT EXISTS loyalty_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  points_per_purchase decimal(5,2) DEFAULT 1.0,
  points_per_currency decimal(5,2) DEFAULT 1.0,
  reward_threshold integer DEFAULT 100,
  reward_value decimal(10,2) DEFAULT 10.0,
  reward_type text DEFAULT 'discount' CHECK (reward_type IN ('discount', 'free_item', 'cashback')),
  is_active boolean DEFAULT true,
  apple_wallet_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  loyalty_points integer DEFAULT 0,
  total_purchases decimal(10,2) DEFAULT 0,
  total_visits integer DEFAULT 0,
  last_visit_at timestamptz,
  apple_wallet_pass_id text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Loyalty Transactions table
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  loyalty_program_id uuid REFERENCES loyalty_programs(id) ON DELETE CASCADE NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('earn', 'redeem', 'expire', 'adjust')),
  points integer NOT NULL,
  description text,
  reference_id text, -- For linking to purchases or other transactions
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id);

-- RLS Policies for employees table
CREATE POLICY "Users can manage own employees"
  ON employees
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for attendance table
CREATE POLICY "Users can manage own employee attendance"
  ON attendance
  FOR ALL
  TO authenticated
  USING (employee_id IN (
    SELECT e.id FROM employees e
    JOIN users u ON e.user_id = u.id
    WHERE u.auth_id = auth.uid()
  ));

-- RLS Policies for payroll table
CREATE POLICY "Users can manage own employee payroll"
  ON payroll
  FOR ALL
  TO authenticated
  USING (employee_id IN (
    SELECT e.id FROM employees e
    JOIN users u ON e.user_id = u.id
    WHERE u.auth_id = auth.uid()
  ));

-- RLS Policies for websites table
CREATE POLICY "Users can manage own websites"
  ON websites
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for loyalty_programs table
CREATE POLICY "Users can manage own loyalty programs"
  ON loyalty_programs
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for customers table
CREATE POLICY "Users can manage own customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for loyalty_transactions table
CREATE POLICY "Users can manage own loyalty transactions"
  ON loyalty_transactions
  FOR ALL
  TO authenticated
  USING (customer_id IN (
    SELECT c.id FROM customers c
    JOIN users u ON c.user_id = u.id
    WHERE u.auth_id = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_websites_user_id ON websites(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer_id ON loyalty_transactions(customer_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_websites_updated_at BEFORE UPDATE ON websites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loyalty_programs_updated_at BEFORE UPDATE ON loyalty_programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();