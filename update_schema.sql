-- Rulați acest script în SQL Editor din Supabase
ALTER TABLE public.meniu 
ADD COLUMN IF NOT EXISTS variante JSONB DEFAULT '[]'::jsonb;
