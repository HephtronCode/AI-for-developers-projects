-- Ensure required extensions are available
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- for gen_random_uuid

-- Create polls table to store poll questions and metadata
CREATE TABLE polls (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
    description TEXT,
    created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create poll_options table to store individual options for each poll
CREATE TABLE poll_options (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id uuid REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
    option_text TEXT NOT NULL CHECK (char_length(trim(option_text)) > 0),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    -- Prevent duplicate options per poll (case/space-insensitive)
    CONSTRAINT unique_option_per_poll UNIQUE (poll_id, (lower(trim(option_text))))
);

-- Create votes table to record user votes on poll options
CREATE TABLE votes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    poll_id uuid REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
    poll_option_id uuid REFERENCES poll_options(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    -- A user can only vote once per poll
    CONSTRAINT unique_vote_per_poll UNIQUE (poll_id, user_id)
);

-- Useful indexes to optimize common queries
CREATE INDEX IF NOT EXISTS idx_polls_created_by ON polls (created_by);
CREATE INDEX IF NOT EXISTS idx_polls_created_at ON polls (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON poll_options (poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON votes (poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_poll_option_id ON votes (poll_option_id);

-- Updated-at trigger function and triggers
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_polls_updated_at
BEFORE UPDATE ON polls
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indexes for performance
CREATE INDEX idx_comments_poll_id ON comments(poll_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Comments for documentation
COMMENT ON TABLE comments IS 'User comments on polls.';
COMMENT ON COLUMN comments.content IS 'The content of the comment.';
COMMENT ON COLUMN comments.created_at IS 'Timestamp when the comment was created.';
COMMENT ON COLUMN comments.updated_at IS 'Timestamp when the comment was last updated.';

CREATE TRIGGER trg_poll_options_updated_at
BEFORE UPDATE ON poll_options
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Policies for the 'polls' table
-- Allow authenticated users to create polls for themselves
CREATE POLICY "Allow authenticated users to create polls" ON polls FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
-- Allow all users (authenticated and anonymous) to view all polls
CREATE POLICY "Allow all users to view polls" ON polls FOR SELECT TO public USING (true);
-- Allow the user who created a poll to update it
CREATE POLICY "Allow poll creator to update their polls" ON polls FOR UPDATE TO authenticated USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);
-- Allow the user who created a poll to delete it
CREATE POLICY "Allow poll creator to delete their polls" ON polls FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Policies for the 'poll_options' table
-- Allow the creator of a poll to add options to it
CREATE POLICY "Allow poll creator to create poll options" ON poll_options FOR INSERT TO authenticated WITH CHECK ((SELECT created_by FROM polls WHERE id = poll_id) = auth.uid());
-- Allow all users to view poll options
CREATE POLICY "Allow all users to view poll options" ON poll_options FOR SELECT TO public USING (true);
-- Allow the poll creator to update options on their polls
CREATE POLICY "Allow poll creator to update their poll options" ON poll_options FOR UPDATE TO authenticated USING ((SELECT created_by FROM polls WHERE id = poll_id) = auth.uid());
-- Allow the poll creator to delete options from their polls
CREATE POLICY "Allow poll creator to delete their poll options" ON poll_options FOR DELETE TO authenticated USING ((SELECT created_by FROM polls WHERE id = poll_id) = auth.uid());

-- Policies for the 'votes' table
-- Allow authenticated users to cast votes
CREATE POLICY "Allow authenticated users to cast votes" ON votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
-- Allow all users to view all votes
CREATE POLICY "Allow all users to view votes" ON votes FOR SELECT TO public USING (true);
-- Allow a user to delete their own vote (change their mind)
CREATE POLICY "Allow users to delete their own votes" ON votes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Policy to allow admins to update user roles
CREATE POLICY "Allow admins to update user roles" ON auth.users FOR UPDATE TO authenticated USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')) WITH CHECK (old.raw_user_meta_data->>'role' = new.raw_user_meta_data->>'role');

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

-- Helpful comments for schema introspection
COMMENT ON TABLE polls IS 'Poll questions and metadata.';
COMMENT ON COLUMN polls.title IS 'The poll question/title.';
COMMENT ON COLUMN polls.created_by IS 'User ID (auth.users.id) of the poll creator.';
COMMENT ON COLUMN polls.created_at IS 'Creation timestamp (UTC).';
COMMENT ON COLUMN polls.updated_at IS 'Last update timestamp (UTC).';

COMMENT ON TABLE poll_options IS 'Answer options for a given poll.';
COMMENT ON COLUMN poll_options.option_text IS 'Display text for the option (unique per poll, case/space-insensitive).';
COMMENT ON COLUMN poll_options.created_at IS 'Creation timestamp (UTC).';
COMMENT ON COLUMN poll_options.updated_at IS 'Last update timestamp (UTC).';

COMMENT ON TABLE votes IS 'User votes for poll options.';
COMMENT ON COLUMN votes.poll_id IS 'The poll being voted on.';
COMMENT ON COLUMN votes.poll_option_id IS 'The selected option for the poll.';
COMMENT ON COLUMN votes.user_id IS 'User who cast the vote.';
COMMENT ON COLUMN votes.created_at IS 'When the vote was cast (UTC).';


-- Comments Table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
-- Policy for comments: Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id););

CREATE TRIGGER trg_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Enable Row Level Security (RLS) for comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policy for comments: All users can read comments
CREATE POLICY "All users can read comments" ON comments
  FOR SELECT USING (TRUE);

-- Policy for comments: Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy for comments: Users can delete their own comments
CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- Policy for comments: Users can update their own comments (optional, if editing is allowed)
CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);