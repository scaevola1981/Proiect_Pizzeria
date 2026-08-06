-- Rulează acest script în SQL Editor din Supabase

-- Ștergem o eventuală politică veche dacă există
DROP POLICY IF EXISTS "Allow public read store schedule" ON public.setari;

-- Permitem citirea setărilor de program pentru toți clienții (neautentificați)
CREATE POLICY "Allow public read store schedule" ON public.setari 
FOR SELECT 
USING (key IN ('store_open_time', 'store_close_time', 'store_force_close'));

