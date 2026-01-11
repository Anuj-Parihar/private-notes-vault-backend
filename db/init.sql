-- Notes table and Row Level Security (RLS) policies

-- Create table
CREATE TABLE IF NOT EXISTS public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Index to help listing notes per user
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON public.notes (user_id);

-- Enable Row Level Security
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to SELECT their own notes
CREATE POLICY IF NOT EXISTS "select_own_notes" ON public.notes
  FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to INSERT only when user_id matches their UID
CREATE POLICY IF NOT EXISTS "insert_own_notes" ON public.notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to DELETE their own notes
CREATE POLICY IF NOT EXISTS "delete_own_notes" ON public.notes
  FOR DELETE USING (auth.uid() = user_id);

-- NOTE: To apply these SQL commands, run this script via the Supabase SQL editor or psql with a
-- service_role key. Be sure to review the policies and adjust them if your auth setup differs.