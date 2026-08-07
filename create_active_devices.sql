-- Creează tabelul pentru dispozitivele active (Tablete Ospătari)
CREATE TABLE IF NOT EXISTS public.active_devices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    device_id TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' sau 'active'
    custom_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Activează Row Level Security
ALTER TABLE public.active_devices ENABLE ROW LEVEL SECURITY;

-- Politici pentru RLS:
-- 1. Orice vizitator anonim (tableta) își poate insera propriul ID sau îl poate citi
CREATE POLICY "Anonimul poate citi propriul device" 
ON public.active_devices FOR SELECT 
TO public
USING (true);

CREATE POLICY "Anonimul își poate insera device-ul" 
ON public.active_devices FOR INSERT 
TO public
WITH CHECK (true);

-- 2. Permite editarea statusului și numelui de pe orice dispozitiv (sau manager)
CREATE POLICY "Orice vizitator sau manager poate edita statusul" 
ON public.active_devices FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);

-- Activează Realtime pe tabel pentru ca tabletele să reacționeze instant
ALTER PUBLICATION supabase_realtime ADD TABLE active_devices;
