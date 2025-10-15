-- ============================================
-- QUERIES DE PRUEBA PARA 2MATCH
-- ============================================

-- 1. VERIFICAR QUE LAS TABLAS EXISTEN
-- ============================================

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Resultado esperado: events, users, event_profiles, matches, match_interactions


-- 2. VERIFICAR QUE LAS FUNCIONES EXISTEN
-- ============================================

SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- Resultado esperado: calculate_contextual_match, get_best_matches, match_affinity, match_explore, match_specific, record_interaction


-- 3. VER EL EVENTO DE EJEMPLO
-- ============================================

SELECT * FROM events;


-- 4. CREAR USUARIOS DE PRUEBA
-- ============================================

-- Usuario 1: Modo Affinity (Intereses en IA y Startups)
INSERT INTO users (id, name, email, bio)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Ana García',
  'ana@example.com',
  'Desarrolladora full-stack apasionada por IA y startups. 5 años de experiencia en React y Python.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO event_profiles (user_id, event_id, connection_mode, interests, personality_traits, conversation_depth)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000001',
  'affinity',
  '["IA", "Startups", "React", "Machine Learning", "Python"]'::jsonb,
  '["Técnico", "Creativo", "Emprendedor"]'::jsonb,
  8
) ON CONFLICT (user_id, event_id) DO NOTHING;

-- Usuario 2: Modo Affinity (Intereses en IA y Marketing)
INSERT INTO users (id, name, email, bio)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Carlos Ruiz',
  'carlos@example.com',
  'Growth hacker especializado en IA para marketing. Fundador de 2 startups.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO event_profiles (user_id, event_id, connection_mode, interests, personality_traits, conversation_depth)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000001',
  'affinity',
  '["IA", "Marketing", "Startups", "Growth Hacking", "Analytics"]'::jsonb,
  '["Emprendedor", "Analítico", "Visionario"]'::jsonb,
  7
) ON CONFLICT (user_id, event_id) DO NOTHING;

-- Usuario 3: Modo Specific (Busca inversor, ofrece prototipo)
INSERT INTO users (id, name, email, bio)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Laura Martín',
  'laura@example.com',
  'Fundadora de startup edtech. Buscando inversión seed para escalar.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO event_profiles (user_id, event_id, connection_mode, seeking, offering)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000001',
  'specific',
  '["Inversor seed", "Mentor en producto", "Experto en educación"]'::jsonb,
  '["Prototipo validado", "100 usuarios activos", "Equipo técnico completo"]'::jsonb
) ON CONFLICT (user_id, event_id) DO NOTHING;

-- Usuario 4: Modo Specific (Inversor que busca startups)
INSERT INTO users (id, name, email, bio)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'Pedro López',
  'pedro@example.com',
  'Business angel. Invierto en startups tech en fase temprana.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO event_profiles (user_id, event_id, connection_mode, seeking, offering)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  '00000000-0000-0000-0000-000000000001',
  'specific',
  '["Startups early-stage", "Equipos técnicos", "Productos innovadores"]'::jsonb,
  '["Capital seed", "Red de contactos", "Mentoría estratégica"]'::jsonb
) ON CONFLICT (user_id, event_id) DO NOTHING;

-- Usuario 5: Modo Explore
INSERT INTO users (id, name, email, bio)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  'María Sánchez',
  'maria@example.com',
  'Diseñadora UX curiosa. Me gusta conocer gente de diferentes backgrounds.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO event_profiles (user_id, event_id, connection_mode, broad_tags)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  '00000000-0000-0000-0000-000000000001',
  'explore',
  '["Diseño", "Tecnología", "Creatividad"]'::jsonb
) ON CONFLICT (user_id, event_id) DO NOTHING;


-- 5. VER TODOS LOS PERFILES CREADOS
-- ============================================

SELECT 
  u.name,
  ep.connection_mode,
  ep.interests,
  ep.seeking,
  ep.offering,
  ep.broad_tags
FROM event_profiles ep
JOIN users u ON ep.user_id = u.id
WHERE ep.event_id = '00000000-0000-0000-0000-000000000001';


-- 6. PROBAR MATCHING ENTRE DOS PERFILES AFFINITY
-- ============================================

-- Ana (IA, Startups, React) vs Carlos (IA, Marketing, Startups)
-- Esperado: ~60-70% (2 intereses comunes, 1 rasgo común)

SELECT * FROM calculate_contextual_match(
  (SELECT id FROM event_profiles WHERE user_id = '11111111-1111-1111-1111-111111111111'),
  (SELECT id FROM event_profiles WHERE user_id = '22222222-2222-2222-2222-222222222222')
);


-- 7. PROBAR MATCHING ENTRE DOS PERFILES SPECIFIC
-- ============================================

-- Laura (busca inversor) vs Pedro (ofrece capital)
-- Esperado: ~90% (match bidireccional perfecto)

SELECT * FROM calculate_contextual_match(
  (SELECT id FROM event_profiles WHERE user_id = '33333333-3333-3333-3333-333333333333'),
  (SELECT id FROM event_profiles WHERE user_id = '44444444-4444-4444-4444-444444444444')
);


-- 8. OBTENER MEJORES MATCHES PARA ANA
-- ============================================

SELECT * FROM get_best_matches(
  (SELECT id FROM event_profiles WHERE user_id = '11111111-1111-1111-1111-111111111111'),
  10
);


-- 9. OBTENER MEJORES MATCHES PARA LAURA
-- ============================================

SELECT * FROM get_best_matches(
  (SELECT id FROM event_profiles WHERE user_id = '33333333-3333-3333-3333-333333333333'),
  10
);


-- 10. SIMULAR INTERACCIÓN: ANA CONECTA CON CARLOS
-- ============================================

-- Primero, crear el match si no existe
INSERT INTO matches (event_id, profile1_id, profile2_id, score, match_type, reason)
SELECT 
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM event_profiles WHERE user_id = '11111111-1111-1111-1111-111111111111'),
  (SELECT id FROM event_profiles WHERE user_id = '22222222-2222-2222-2222-222222222222'),
  cm.score,
  cm.match_type,
  cm.reason
FROM calculate_contextual_match(
  (SELECT id FROM event_profiles WHERE user_id = '11111111-1111-1111-1111-111111111111'),
  (SELECT id FROM event_profiles WHERE user_id = '22222222-2222-2222-2222-222222222222')
) cm
ON CONFLICT (profile1_id, profile2_id) DO NOTHING;

-- Luego, registrar la interacción
SELECT record_interaction(
  (SELECT id FROM matches WHERE 
    profile1_id = (SELECT id FROM event_profiles WHERE user_id = '11111111-1111-1111-1111-111111111111') AND
    profile2_id = (SELECT id FROM event_profiles WHERE user_id = '22222222-2222-2222-2222-222222222222')
  ),
  '11111111-1111-1111-1111-111111111111',
  'connected'
);


-- 11. VER TODAS LAS INTERACCIONES
-- ============================================

SELECT 
  u.name as usuario,
  mi.action as accion,
  u2.name as con_quien,
  mi.created_at
FROM match_interactions mi
JOIN users u ON mi.user_id = u.id
JOIN matches m ON mi.match_id = m.id
JOIN event_profiles ep ON (
  CASE WHEN m.profile1_id = (SELECT id FROM event_profiles WHERE user_id = u.id)
       THEN m.profile2_id
       ELSE m.profile1_id
  END = ep.id
)
JOIN users u2 ON ep.user_id = u2.id
ORDER BY mi.created_at DESC;


-- 12. ESTADÍSTICAS DEL EVENTO
-- ============================================

-- Total de perfiles por modo
SELECT 
  connection_mode,
  COUNT(*) as total
FROM event_profiles
WHERE event_id = '00000000-0000-0000-0000-000000000001'
GROUP BY connection_mode;

-- Distribución de scores de matches
SELECT 
  CASE 
    WHEN score >= 80 THEN 'Excelente (80-100%)'
    WHEN score >= 60 THEN 'Bueno (60-79%)'
    WHEN score >= 40 THEN 'Medio (40-59%)'
    ELSE 'Bajo (0-39%)'
  END as rango_score,
  COUNT(*) as cantidad
FROM matches
WHERE event_id = '00000000-0000-0000-0000-000000000001'
GROUP BY 
  CASE 
    WHEN score >= 80 THEN 'Excelente (80-100%)'
    WHEN score >= 60 THEN 'Bueno (60-79%)'
    WHEN score >= 40 THEN 'Medio (40-59%)'
    ELSE 'Bajo (0-39%)'
  END
ORDER BY MIN(score) DESC;

-- Interacciones por tipo
SELECT 
  action,
  COUNT(*) as total
FROM match_interactions mi
JOIN matches m ON mi.match_id = m.id
WHERE m.event_id = '00000000-0000-0000-0000-000000000001'
GROUP BY action;


-- 13. LIMPIAR DATOS DE PRUEBA
-- ============================================

-- ⚠️ CUIDADO: Esto borrará todos los datos de prueba

-- DELETE FROM match_interactions;
-- DELETE FROM matches;
-- DELETE FROM event_profiles WHERE user_id IN (
--   '11111111-1111-1111-1111-111111111111',
--   '22222222-2222-2222-2222-222222222222',
--   '33333333-3333-3333-3333-333333333333',
--   '44444444-4444-4444-4444-444444444444',
--   '55555555-5555-5555-5555-555555555555'
-- );
-- DELETE FROM users WHERE id IN (
--   '11111111-1111-1111-1111-111111111111',
--   '22222222-2222-2222-2222-222222222222',
--   '33333333-3333-3333-3333-333333333333',
--   '44444444-4444-4444-4444-444444444444',
--   '55555555-5555-5555-5555-555555555555'
-- );


-- 14. VERIFICAR POLÍTICAS RLS
-- ============================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;


-- 15. VERIFICAR ÍNDICES
-- ============================================

SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;


-- ============================================
-- QUERIES ÚTILES PARA DEBUGGING
-- ============================================

-- Ver perfiles con sus datos JSONB expandidos
SELECT 
  u.name,
  ep.connection_mode,
  jsonb_array_elements_text(ep.interests) as interes
FROM event_profiles ep
JOIN users u ON ep.user_id = u.id
WHERE ep.interests IS NOT NULL
AND jsonb_array_length(ep.interests) > 0;

-- Ver matches con nombres de usuarios
SELECT 
  u1.name as usuario1,
  u2.name as usuario2,
  m.score,
  m.match_type,
  m.reason
FROM matches m
JOIN event_profiles ep1 ON m.profile1_id = ep1.id
JOIN event_profiles ep2 ON m.profile2_id = ep2.id
JOIN users u1 ON ep1.user_id = u1.id
JOIN users u2 ON ep2.user_id = u2.id
ORDER BY m.score DESC;

-- Contar matches por usuario
SELECT 
  u.name,
  COUNT(*) as total_matches,
  AVG(m.score) as score_promedio
FROM users u
JOIN event_profiles ep ON u.id = ep.user_id
JOIN matches m ON (ep.id = m.profile1_id OR ep.id = m.profile2_id)
GROUP BY u.id, u.name
ORDER BY total_matches DESC;
