-- ============================================
-- MIGRACIÓN LIMPIA - Solo añade lo que falta
-- ============================================

-- 1. Verificar si las tablas existen, si no, crearlas
DO $$ 
BEGIN
    -- Crear tabla events si no existe
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'events') THEN
        CREATE TABLE events (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            description TEXT,
            location TEXT,
            event_date TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
        
        -- Insertar evento de ejemplo
        INSERT INTO events (id, name, description, location, event_date)
        VALUES (
            '00000000-0000-0000-0000-000000000001',
            'Tech Networking Madrid 2025',
            'Evento de networking para profesionales tech',
            'Madrid, España',
            NOW() + INTERVAL '7 days'
        );
    END IF;

    -- Crear tabla users si no existe
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        CREATE TABLE users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            avatar_url TEXT,
            bio TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
    END IF;

    -- Crear tabla event_profiles si no existe
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'event_profiles') THEN
        CREATE TABLE event_profiles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            event_id UUID REFERENCES events(id) ON DELETE CASCADE,
            connection_mode TEXT NOT NULL CHECK (connection_mode IN ('affinity', 'specific', 'explore')),
            interests JSONB DEFAULT '[]'::JSONB,
            personality_traits JSONB DEFAULT '[]'::JSONB,
            seeking JSONB DEFAULT '[]'::JSONB,
            offering JSONB DEFAULT '[]'::JSONB,
            broad_tags JSONB DEFAULT '[]'::JSONB,
            skills JSONB DEFAULT '[]'::JSONB,
            current_project TEXT,
            has_active_project BOOLEAN DEFAULT false,
            commitment_level INT DEFAULT 5 CHECK (commitment_level BETWEEN 1 AND 10),
            availability JSONB DEFAULT '[]'::JSONB,
            conversation_depth INT DEFAULT 5 CHECK (conversation_depth BETWEEN 1 AND 10),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            UNIQUE(user_id, event_id)
        );
    END IF;

    -- Crear tabla matches si no existe
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'matches') THEN
        CREATE TABLE matches (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            event_id UUID REFERENCES events(id) ON DELETE CASCADE,
            profile1_id UUID REFERENCES event_profiles(id) ON DELETE CASCADE,
            profile2_id UUID REFERENCES event_profiles(id) ON DELETE CASCADE,
            score FLOAT NOT NULL CHECK (score >= 0 AND score <= 100),
            match_type TEXT CHECK (match_type IN ('affinity', 'complementary', 'serendipity', 'hybrid')),
            reason JSONB DEFAULT '{}'::JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            UNIQUE(profile1_id, profile2_id)
        );
    END IF;

    -- Crear tabla match_interactions si no existe
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'match_interactions') THEN
        CREATE TABLE match_interactions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
            user_id UUID REFERENCES users(id),
            action TEXT NOT NULL CHECK (action IN ('viewed', 'interested', 'passed', 'connected', 'chatted')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
    END IF;
END $$;

-- 2. Añadir nuevos campos a event_profiles si no existen
ALTER TABLE event_profiles 
ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::JSONB,
ADD COLUMN IF NOT EXISTS current_project TEXT,
ADD COLUMN IF NOT EXISTS has_active_project BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS commitment_level INT DEFAULT 5 CHECK (commitment_level BETWEEN 1 AND 10),
ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '[]'::JSONB;

-- 3. Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_event_profiles_event ON event_profiles(event_id);
CREATE INDEX IF NOT EXISTS idx_event_profiles_user ON event_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_event_profiles_mode ON event_profiles(connection_mode);
CREATE INDEX IF NOT EXISTS idx_event_profiles_interests ON event_profiles USING GIN (interests);
CREATE INDEX IF NOT EXISTS idx_event_profiles_seeking ON event_profiles USING GIN (seeking);
CREATE INDEX IF NOT EXISTS idx_event_profiles_offering ON event_profiles USING GIN (offering);
CREATE INDEX IF NOT EXISTS idx_event_profiles_skills ON event_profiles USING GIN (skills);
CREATE INDEX IF NOT EXISTS idx_event_profiles_availability ON event_profiles USING GIN (availability);
CREATE INDEX IF NOT EXISTS idx_event_profiles_commitment ON event_profiles(commitment_level);
CREATE INDEX IF NOT EXISTS idx_event_profiles_has_project ON event_profiles(has_active_project);

CREATE INDEX IF NOT EXISTS idx_matches_profile1 ON matches(profile1_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_matches_profile2 ON matches(profile2_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_matches_event ON matches(event_id);

CREATE INDEX IF NOT EXISTS idx_interactions_match ON match_interactions(match_id);
CREATE INDEX IF NOT EXISTS idx_interactions_user ON match_interactions(user_id, created_at DESC);

-- 4. Habilitar RLS si no está habilitado
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_interactions ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas solo si no existen
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Allow public read on events') THEN
        CREATE POLICY "Allow public read on events" ON events FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow public insert on users') THEN
        CREATE POLICY "Allow public insert on users" ON users FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow public read on users') THEN
        CREATE POLICY "Allow public read on users" ON users FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_profiles' AND policyname = 'Allow public insert on event_profiles') THEN
        CREATE POLICY "Allow public insert on event_profiles" ON event_profiles FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_profiles' AND policyname = 'Allow public read on event_profiles') THEN
        CREATE POLICY "Allow public read on event_profiles" ON event_profiles FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'matches' AND policyname = 'Allow public read on matches') THEN
        CREATE POLICY "Allow public read on matches" ON matches FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'match_interactions' AND policyname = 'Allow public insert on match_interactions') THEN
        CREATE POLICY "Allow public insert on match_interactions" ON match_interactions FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- 6. Verificación final
SELECT 
    'Tablas creadas:' as status,
    COUNT(*) as count
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('events', 'users', 'event_profiles', 'matches', 'match_interactions');

SELECT 
    'Columnas en event_profiles:' as status,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'event_profiles'
ORDER BY ordinal_position;
