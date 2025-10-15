-- ============================================
-- FUNCIONES DE MATCHING
-- ============================================

-- Eliminar funciones existentes si existen
DROP FUNCTION IF EXISTS match_affinity CASCADE;
DROP FUNCTION IF EXISTS match_specific CASCADE;
DROP FUNCTION IF EXISTS match_explore CASCADE;
DROP FUNCTION IF EXISTS calculate_contextual_match CASCADE;
DROP FUNCTION IF EXISTS get_best_matches CASCADE;
DROP FUNCTION IF EXISTS record_interaction CASCADE;

-- Función: Matching para modo 'affinity'
CREATE OR REPLACE FUNCTION match_affinity(
  p1_interests JSONB,
  p1_traits JSONB,
  p1_depth INT,
  p2_interests JSONB,
  p2_traits JSONB,
  p2_depth INT
)
RETURNS TABLE (score FLOAT, reason JSONB) AS $$
DECLARE
  common_interests INT := 0;
  common_traits INT := 0;
  total_interests INT;
  total_traits INT;
  interest_score FLOAT := 0;
  trait_score FLOAT := 0;
  depth_compatibility FLOAT := 0;
  total_score FLOAT := 0;
  explanation JSONB;
BEGIN
  -- Contar intereses comunes (con validación de tipo)
  IF jsonb_typeof(p1_interests) = 'array' AND jsonb_typeof(p2_interests) = 'array' THEN
    SELECT COUNT(*) INTO common_interests
    FROM jsonb_array_elements_text(p1_interests) AS i1
    INNER JOIN jsonb_array_elements_text(p2_interests) AS i2 ON i1 = i2;
    
    total_interests := GREATEST(
      jsonb_array_length(p1_interests), 
      jsonb_array_length(p2_interests),
      1
    );
    
    interest_score := LEAST((common_interests::FLOAT / total_interests) * 50, 50);
  END IF;
  
  -- Rasgos de personalidad comunes (con validación de tipo)
  IF jsonb_typeof(p1_traits) = 'array' AND jsonb_typeof(p2_traits) = 'array' AND 
     jsonb_array_length(p1_traits) > 0 AND jsonb_array_length(p2_traits) > 0 THEN
    SELECT COUNT(*) INTO common_traits
    FROM jsonb_array_elements_text(p1_traits) AS t1
    INNER JOIN jsonb_array_elements_text(p2_traits) AS t2 ON t1 = t2;
    
    total_traits := GREATEST(
      jsonb_array_length(p1_traits),
      jsonb_array_length(p2_traits),
      1
    );
    
    trait_score := LEAST((common_traits::FLOAT / total_traits) * 30, 30);
  END IF;
  
  -- Compatibilidad de profundidad de conversación
  depth_compatibility := 20 - (ABS(p1_depth - p2_depth) * 2);
  depth_compatibility := GREATEST(depth_compatibility, 0);
  
  total_score := interest_score + trait_score + depth_compatibility;
  
  explanation := jsonb_build_object(
    'common_interests', common_interests,
    'common_traits', common_traits,
    'conversation_compatibility', 
      CASE 
        WHEN ABS(p1_depth - p2_depth) <= 2 THEN 'high'
        WHEN ABS(p1_depth - p2_depth) <= 4 THEN 'medium'
        ELSE 'low'
      END
  );
  
  RETURN QUERY SELECT total_score, explanation;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función: Matching para modo 'specific'
CREATE OR REPLACE FUNCTION match_specific(
  p1_seeking JSONB,
  p1_offering JSONB,
  p2_seeking JSONB,
  p2_offering JSONB
)
RETURNS TABLE (score FLOAT, reason JSONB) AS $$
DECLARE
  p1_seeks_p2_offers INT := 0;
  p2_seeks_p1_offers INT := 0;
  complementary_matches INT := 0;
  total_score FLOAT := 0;
  explanation JSONB;
  is_bidirectional BOOLEAN := false;
BEGIN
  -- Lo que p1 busca y p2 ofrece (con validación de tipo)
  IF jsonb_typeof(p1_seeking) = 'array' AND jsonb_typeof(p2_offering) = 'array' AND
     jsonb_array_length(p1_seeking) > 0 AND jsonb_array_length(p2_offering) > 0 THEN
    SELECT COUNT(*) INTO p1_seeks_p2_offers
    FROM jsonb_array_elements_text(p1_seeking) AS s1
    INNER JOIN jsonb_array_elements_text(p2_offering) AS o2 ON s1 = o2;
  END IF;
  
  -- Lo que p2 busca y p1 ofrece (con validación de tipo)
  IF jsonb_typeof(p2_seeking) = 'array' AND jsonb_typeof(p1_offering) = 'array' AND
     jsonb_array_length(p2_seeking) > 0 AND jsonb_array_length(p1_offering) > 0 THEN
    SELECT COUNT(*) INTO p2_seeks_p1_offers
    FROM jsonb_array_elements_text(p2_seeking) AS s2
    INNER JOIN jsonb_array_elements_text(p1_offering) AS o1 ON s2 = o1;
  END IF;
  
  complementary_matches := p1_seeks_p2_offers + p2_seeks_p1_offers;
  
  -- Puntuación alta si hay complementariedad
  total_score := LEAST(complementary_matches * 30, 100);
  
  -- Bonus si es bidireccional
  is_bidirectional := (p1_seeks_p2_offers > 0 AND p2_seeks_p1_offers > 0);
  IF is_bidirectional THEN
    total_score := LEAST(total_score * 1.5, 100);
  END IF;
  
  explanation := jsonb_build_object(
    'you_seek_they_offer', p1_seeks_p2_offers,
    'they_seek_you_offer', p2_seeks_p1_offers,
    'bidirectional', is_bidirectional
  );
  
  RETURN QUERY SELECT total_score, explanation;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función: Matching para modo 'explore'
CREATE OR REPLACE FUNCTION match_explore(
  p1_tags JSONB,
  p2_tags JSONB
)
RETURNS TABLE (score FLOAT, reason JSONB) AS $$
DECLARE
  random_score FLOAT;
  diversity_bonus FLOAT := 0;
  common_tags INT := 0;
  total_tags INT;
  explanation JSONB;
BEGIN
  -- Base aleatoria entre 30-70
  random_score := 30 + (random() * 40);
  
  -- Bonus si tienen backgrounds diferentes (más diversidad) - con validación de tipo
  IF jsonb_typeof(p1_tags) = 'array' AND jsonb_typeof(p2_tags) = 'array' AND
     jsonb_array_length(p1_tags) > 0 AND jsonb_array_length(p2_tags) > 0 THEN
    SELECT COUNT(*) INTO common_tags
    FROM jsonb_array_elements_text(p1_tags) AS t1
    INNER JOIN jsonb_array_elements_text(p2_tags) AS t2 ON t1 = t2;
    
    total_tags := GREATEST(
      jsonb_array_length(p1_tags),
      jsonb_array_length(p2_tags),
      1
    );
    
    -- Cuanto menos overlap, más bonus (serendipity)
    diversity_bonus := 20 * (1 - (common_tags::FLOAT / total_tags));
  ELSE
    diversity_bonus := 10;
  END IF;
  
  explanation := jsonb_build_object(
    'type', 'serendipitous',
    'diversity_score', diversity_bonus
  );
  
  RETURN QUERY SELECT random_score + diversity_bonus, explanation;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Función: Calcular match contextual
CREATE OR REPLACE FUNCTION calculate_contextual_match(
  profile1_id UUID,
  profile2_id UUID
)
RETURNS TABLE (
  score FLOAT,
  match_type TEXT,
  reason JSONB
) AS $$
DECLARE
  p1 event_profiles;
  p2 event_profiles;
  final_score FLOAT := 0;
  match_reason JSONB := '{}'::JSONB;
  match_category TEXT;
  affinity_result RECORD;
  specific_result RECORD;
  explore_result RECORD;
BEGIN
  -- Obtener perfiles
  SELECT * INTO p1 FROM event_profiles WHERE id = profile1_id;
  SELECT * INTO p2 FROM event_profiles WHERE id = profile2_id;
  
  -- CASO 1: Ambos en modo 'affinity'
  IF p1.connection_mode = 'affinity' AND p2.connection_mode = 'affinity' THEN
    SELECT * INTO affinity_result FROM match_affinity(
      p1.interests, p1.personality_traits, p1.conversation_depth,
      p2.interests, p2.personality_traits, p2.conversation_depth
    );
    final_score := affinity_result.score;
    match_reason := affinity_result.reason;
    match_category := 'affinity';
    
  -- CASO 2: Al menos uno en modo 'specific'
  ELSIF p1.connection_mode = 'specific' OR p2.connection_mode = 'specific' THEN
    SELECT * INTO specific_result FROM match_specific(
      p1.seeking, p1.offering,
      p2.seeking, p2.offering
    );
    final_score := specific_result.score;
    match_reason := specific_result.reason;
    match_category := 'complementary';
    
  -- CASO 3: Al menos uno en modo 'explore'
  ELSIF p1.connection_mode = 'explore' OR p2.connection_mode = 'explore' THEN
    SELECT * INTO explore_result FROM match_explore(
      p1.broad_tags, p2.broad_tags
    );
    final_score := explore_result.score;
    match_reason := explore_result.reason;
    match_category := 'serendipity';
    
  -- CASO 4: Modos mixtos - híbrido
  ELSE
    SELECT * INTO affinity_result FROM match_affinity(
      p1.interests, p1.personality_traits, p1.conversation_depth,
      p2.interests, p2.personality_traits, p2.conversation_depth
    );
    SELECT * INTO specific_result FROM match_specific(
      p1.seeking, p1.offering,
      p2.seeking, p2.offering
    );
    
    final_score := (affinity_result.score * 0.4) + (specific_result.score * 0.6);
    match_reason := jsonb_build_object(
      'affinity_component', affinity_result.reason,
      'specific_component', specific_result.reason
    );
    match_category := 'hybrid';
  END IF;
  
  RETURN QUERY SELECT final_score, match_category, match_reason;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Función: Obtener mejores matches
CREATE OR REPLACE FUNCTION get_best_matches(
  for_profile_id UUID,
  limit_count INT DEFAULT 20
)
RETURNS TABLE (
  profile_id UUID,
  user_name TEXT,
  user_avatar TEXT,
  user_bio TEXT,
  connection_mode TEXT,
  match_score FLOAT,
  match_type TEXT,
  match_reason JSONB,
  interests JSONB,
  seeking JSONB,
  offering JSONB,
  personality_traits JSONB,
  broad_tags JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH target_profile AS (
    SELECT * FROM event_profiles WHERE id = for_profile_id
  ),
  candidate_profiles AS (
    SELECT ep.*
    FROM event_profiles ep, target_profile tp
    WHERE ep.event_id = tp.event_id
    AND ep.id != for_profile_id
    AND ep.id NOT IN (
      -- Excluir ya interactuados negativamente
      SELECT ep2.id
      FROM matches m
      JOIN match_interactions mi ON m.id = mi.match_id
      JOIN event_profiles ep2 ON (
        CASE WHEN m.profile1_id = for_profile_id 
             THEN m.profile2_id 
             ELSE m.profile1_id 
        END = ep2.id
      )
      WHERE (m.profile1_id = for_profile_id OR m.profile2_id = for_profile_id)
      AND mi.user_id = (SELECT user_id FROM event_profiles WHERE id = for_profile_id)
      AND mi.action = 'passed'
    )
  ),
  calculated_matches AS (
    SELECT 
      cp.id,
      cm.score,
      cm.match_type,
      cm.reason
    FROM candidate_profiles cp
    CROSS JOIN LATERAL calculate_contextual_match(for_profile_id, cp.id) cm
    WHERE cm.score > 20 -- Umbral mínimo
  )
  SELECT 
    cm.id,
    u.name,
    u.avatar_url,
    u.bio,
    ep.connection_mode,
    cm.score,
    cm.match_type,
    cm.reason,
    ep.interests,
    ep.seeking,
    ep.offering,
    ep.personality_traits,
    ep.broad_tags
  FROM calculated_matches cm
  JOIN event_profiles ep ON cm.id = ep.id
  JOIN users u ON ep.user_id = u.id
  ORDER BY 
    cm.score DESC,
    CASE cm.match_type
      WHEN 'complementary' THEN 1
      WHEN 'affinity' THEN 2
      WHEN 'serendipity' THEN 3
      ELSE 4
    END,
    RANDOM()
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Función: Registrar interacción
CREATE OR REPLACE FUNCTION record_interaction(
  p_match_id UUID,
  p_user_id UUID,
  p_action TEXT
)
RETURNS VOID AS $$
DECLARE
  match_record matches;
BEGIN
  -- Registrar interacción
  INSERT INTO match_interactions (match_id, user_id, action)
  VALUES (p_match_id, p_user_id, p_action);
  
  -- Ajustar score según feedback
  SELECT * INTO match_record FROM matches WHERE id = p_match_id;
  
  IF p_action = 'connected' OR p_action = 'chatted' THEN
    -- Feedback positivo: aumentar score de matches similares
    UPDATE matches m
    SET score = LEAST(score * 1.1, 100)
    WHERE (m.profile1_id = match_record.profile1_id 
           OR m.profile2_id = match_record.profile1_id)
    AND m.match_type = match_record.match_type
    AND m.id != p_match_id;
    
  ELSIF p_action = 'passed' THEN
    -- Reducir score de este match
    UPDATE matches
    SET score = score * 0.5
    WHERE id = p_match_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Verificar que las funciones se crearon
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
AND routine_name IN ('match_affinity', 'match_specific', 'match_explore', 'calculate_contextual_match', 'get_best_matches', 'record_interaction')
ORDER BY routine_name;
