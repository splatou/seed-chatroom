-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous users to read messages
CREATE POLICY "Allow anonymous read" ON public.messages
  FOR SELECT USING (true);

-- Create policy for anonymous users to insert messages
CREATE POLICY "Allow anonymous insert" ON public.messages
  FOR INSERT WITH CHECK (true);

-- Create policy for admins to delete messages (you'll need to set up admin authentication)
CREATE POLICY "Allow admin delete" ON public.messages
  FOR DELETE USING (auth.role() = 'authenticated');

-- Set up realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
