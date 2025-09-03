-- Create a stored procedure to efficiently get poll options with vote counts in a single query
CREATE OR REPLACE FUNCTION get_options_with_vote_counts(poll_id_param UUID)
RETURNS TABLE (
    id UUID,
    poll_id UUID,
    option_text TEXT,
    vote_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        po.id,
        po.poll_id,
        po.option_text,
        COUNT(v.id)::BIGINT AS vote_count
    FROM 
        poll_options po
    LEFT JOIN 
        votes v ON po.id = v.poll_option_id
    WHERE 
        po.poll_id = poll_id_param
    GROUP BY 
        po.id, po.poll_id, po.option_text
    ORDER BY 
        po.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION get_options_with_vote_counts(UUID) TO authenticated, anon;

-- Comment explaining the function
COMMENT ON FUNCTION get_options_with_vote_counts(UUID) IS 'Gets all options for a poll with their vote counts in a single efficient query';