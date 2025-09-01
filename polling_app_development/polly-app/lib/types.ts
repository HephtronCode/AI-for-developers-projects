// Poll option with vote count
export type PollOption = {
  id: string;
  text: string;
  votes?: number;
};

// Complete poll type for editing forms
export type Poll = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  created_by: string;
  options: PollOption[];
  total_votes?: number;
};

// Poll option for creating/updating (without ID)
export type CreatePollOption = {
  text: string;
};

// Data structure for creating a new poll
export type CreatePollData = {
  title: string;
  description?: string;
  options: CreatePollOption[];
};

// Data structure for updating an existing poll
export type UpdatePollData = {
  title: string;
  description?: string;
  options: CreatePollOption[];
};

// Simplified poll type for list views
export type PollSummary = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  created_by: string;
  user_email?: string;
  options_count: number;
  votes_count: number;
};
