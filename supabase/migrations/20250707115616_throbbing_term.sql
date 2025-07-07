/*
# Add Monthly API Usage Function

1. New Functions
  - `get_monthly_api_usage` - Calculates total API usage for a user within a date range

2. Purpose
  - Provides efficient way to calculate monthly API usage
  - Supports API usage limit enforcement
  - Enables accurate reporting for billing and analytics
*/

-- Create function to get monthly API usage
CREATE OR REPLACE FUNCTION get_monthly_api_usage(
  p_user_id UUID,
  p_api_type TEXT,
  p_start_date DATE
)
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(total_characters), 0)::INTEGER
  FROM daily_api_usage
  WHERE user_id = p_user_id
    AND api_type = p_api_type
    AND usage_date >= p_start_date
    AND usage_date <= CURRENT_DATE;
$$;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION get_monthly_api_usage TO public;

-- Add comment to function
COMMENT ON FUNCTION get_monthly_api_usage IS 'Calculates total API usage for a user within a date range';