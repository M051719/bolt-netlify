/*
  # Create Admin User Setup

  1. Admin Role Management
    - Add admin role to user metadata
    - Create admin policies for foreclosure responses
  
  2. Security
    - Ensure only designated admins can access admin features
    - Maintain data security and privacy
*/

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id 
    AND (
      raw_user_meta_data->>'role' = 'admin' OR
      email = 'admin@repmotivatedseller.org'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update admin policy for foreclosure responses
DROP POLICY IF EXISTS "Admins can read all foreclosure responses" ON foreclosure_responses;

CREATE POLICY "Admins can read all foreclosure responses"
  ON foreclosure_responses
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Add admin update policy
CREATE POLICY "Admins can update all foreclosure responses"
  ON foreclosure_responses
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Add admin delete policy (optional, for data management)
CREATE POLICY "Admins can delete foreclosure responses"
  ON foreclosure_responses
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Grant admin access to user management (if needed)
-- Note: This would require additional setup for user management features