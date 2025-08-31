-- Create polls table to store poll questions and metadata
CREATE TABLE polls (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL CHECK (char_length(title) > 0),
    description TEXT,
    created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create poll_options table to store individual options for each poll
CREATE TABLE poll_options (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id uuid REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
    option_text TEXT NOT NULL CHECK (char_length(option_text) > 0)
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