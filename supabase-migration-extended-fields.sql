-- ============================================
-- MIGRACIÓN: Añadir campos extendidos a event_profiles
-- ============================================

-- Añadir nuevos campos a la tabla event_profiles
ALTER TABLE event_profiles 
ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::JSONB,
ADD COLUMN IF NOT EXISTS current_project TEXT,
ADD COLUMN IF NOT EXISTS has_active_project BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS commitment_level INT DEFAULT 5 CHECK (commitment_level BETWEEN 1 AND 10),
ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '[]'::JSONB;

-- Añadir índices para los nuevos campos JSONB
CREATE INDEX IF NOT EXISTS idx_event_profiles_skills ON event_profiles USING GIN (skills);
CREATE INDEX IF NOT EXISTS idx_event_profiles_availability ON event_profiles USING GIN (availability);

-- Añadir índice para commitment_level (útil para filtrar por nivel de compromiso)
CREATE INDEX IF NOT EXISTS idx_event_profiles_commitment ON event_profiles(commitment_level);

-- Añadir índice para has_active_project (útil para filtrar por proyecto activo)
CREATE INDEX IF NOT EXISTS idx_event_profiles_has_project ON event_profiles(has_active_project);

-- Comentarios para documentar los campos
COMMENT ON COLUMN event_profiles.skills IS 'Habilidades y fortalezas del usuario (array de strings)';
COMMENT ON COLUMN event_profiles.current_project IS 'Descripción del proyecto actual en el que trabaja';
COMMENT ON COLUMN event_profiles.has_active_project IS 'Indica si el usuario tiene un proyecto activo';
COMMENT ON COLUMN event_profiles.commitment_level IS 'Nivel de compromiso disponible (1-10)';
COMMENT ON COLUMN event_profiles.availability IS 'Disponibilidad horaria (array de strings: "Tiempo completo", "Solo tardes", etc.)';

-- Verificar que los campos se añadieron correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'event_profiles'
AND column_name IN ('skills', 'current_project', 'has_active_project', 'commitment_level', 'availability')
ORDER BY ordinal_position;
