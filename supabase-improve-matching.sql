-- ============================================
-- MEJORAR ALGORITMO DE MATCHING
-- Matching por categorías, no solo tags exactos
-- ============================================

-- Función auxiliar: Extraer categoría de un tag
CREATE OR REPLACE FUNCTION get_tag_category(tag TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Tecnología
  IF tag ILIKE '%desarrollador%' OR tag ILIKE '%developer%' OR tag ILIKE '%programación%' OR
     tag ILIKE '%frontend%' OR tag ILIKE '%backend%' OR tag ILIKE '%fullstack%' OR tag ILIKE '%full stack%' OR
     tag IN ('IA', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
             'Blockchain', 'Web3', 'Smart Contracts', 'DeFi', 'NFT',
             'Cloud', 'AWS', 'Azure', 'GCP', 'DevOps', 'CI/CD',
             'React', 'Vue', 'Angular', 'Node.js', 'Python', 'JavaScript',
             'Mobile', 'iOS', 'Android', 'React Native', 'Flutter',
             'Data Science', 'Big Data', 'Analytics', 'Data Analytics', 'Marketing Analytics', 'Web Analytics',
             'Ciberseguridad', 'Seguridad', 'IoT', 'Edge Computing',
             'Mobile Development', 'Bases de datos', 'Testing', 'QA', 'Arquitectura',
             'CTO', 'Cofundador técnico (CTO)', 'Equipo técnico', 'Developers', 'Designers') THEN
    RETURN 'Tecnología';
  
  -- Negocios
  ELSIF tag IN ('Startups', 'Emprendimiento', 'Inversión', 'Venture Capital', 'Angel Investing',
                'Fundraising', 'Pitch Deck', 'Business Model', 'Lean Startup',
                'Product-Market Fit', 'Go-to-Market', 'Escalabilidad',
                'SaaS', 'B2B', 'B2C', 'Marketplace', 'E-commerce', 'Retail', 'Ventas Retail',
                'Fintech', 'Healthtech', 'Edtech', 'Proptech', 'Agritech',
                'Logística', 'Supply Chain', 'Operaciones', 'Procesos',
                'Estrategia', 'Business Development', 'Ventas', 'Negociación',
                'Pitch', 'Finanzas', 'Contabilidad', 'Legal', 'Compliance') THEN
    RETURN 'Negocios';
  
  -- Marketing
  ELSIF tag ILIKE '%marketing%' OR tag ILIKE '%seo%' OR tag ILIKE '%sem%' OR
        tag IN ('Growth Hacking', 'Social Media', 'Community Management', 'Influencer Marketing',
                'Email Marketing', 'Marketing Automation', 'CRM Marketing', 'CRM Ventas', 'Lead Generation',
                'Conversion Rate Optimization', 'A/B Testing',
                'Branding', 'Branding Design', 'Copywriting', 'Storytelling', 'PR', 'Comunicación',
                'Performance Marketing', 'Paid Ads', 'Facebook Ads', 'Google Ads',
                'Content', 'Growth', 'Community', 'Marketer', 'Marketers') THEN
    RETURN 'Marketing';
  
  -- Producto/Diseño
  ELSIF tag IN ('Product Management', 'Product Design', 'UX', 'UI', 'UX Research',
                'User Testing', 'Wireframing', 'Prototyping', 'Design Thinking',
                'Figma', 'Sketch', 'Adobe XD', 'Design Systems',
                'Product Strategy', 'Roadmap', 'Priorización', 'Métricas de Producto',
                'Customer Development', 'Jobs to be Done', 'User Stories',
                'UI Design', 'UX Design', 'Graphic Design', 'Ilustración',
                'Animación', 'Video', 'Fotografía', 'Motion Graphics', '3D', 'Prototipado') THEN
    RETURN 'Producto';
  
  -- Ventas
  ELSIF tag IN ('Sales', 'Account Management', 'Customer Success',
                'Prospección', 'Cold Calling', 'Cold Email', 'LinkedIn Sales',
                'Closing', 'Pipeline Management',
                'Enterprise Sales', 'SMB Sales', 'Inside Sales', 'Field Sales',
                'Channel Sales', 'Partner Management') THEN
    RETURN 'Ventas';
  
  -- Gestión
  ELSIF tag IN ('Project Management', 'Agile', 'Scrum',
                'Liderazgo', 'Team Building', 'Presentaciones',
                'Facilitación', 'Coaching', 'Mentoría', 'Recruiting',
                'Recursos Humanos', 'Talent Acquisition', 'Cultura Organizacional') THEN
    RETURN 'Gestión';
  
  ELSE
    RETURN 'Otros';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Actualizar función de matching por afinidad
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
  common_categories INT := 0;
  common_traits INT := 0;
  total_interests INT;
  total_traits INT;
  interest_score FLOAT := 0;
  category_score FLOAT := 0;
  trait_score FLOAT := 0;
  depth_compatibility FLOAT := 0;
  total_score FLOAT := 0;
  explanation JSONB;
  p1_categories TEXT[];
  p2_categories TEXT[];
BEGIN
  -- Contar intereses exactos comunes
  IF jsonb_typeof(p1_interests) = 'array' AND jsonb_typeof(p2_interests) = 'array' THEN
    SELECT COUNT(*) INTO common_interests
    FROM jsonb_array_elements_text(p1_interests) AS i1
    INNER JOIN jsonb_array_elements_text(p2_interests) AS i2 ON i1 = i2;
    
    -- Contar categorías comunes (más flexible)
    SELECT ARRAY_AGG(DISTINCT get_tag_category(value::TEXT)) INTO p1_categories
    FROM jsonb_array_elements_text(p1_interests);
    
    SELECT ARRAY_AGG(DISTINCT get_tag_category(value::TEXT)) INTO p2_categories
    FROM jsonb_array_elements_text(p2_interests);
    
    SELECT COUNT(*) INTO common_categories
    FROM unnest(p1_categories) AS c1
    INNER JOIN unnest(p2_categories) AS c2 ON c1 = c2;
    
    total_interests := GREATEST(
      jsonb_array_length(p1_interests), 
      jsonb_array_length(p2_interests),
      1
    );
    
    -- Puntuación por intereses exactos (30%)
    interest_score := LEAST((common_interests::FLOAT / total_interests) * 30, 30);
    
    -- Puntuación por categorías comunes (30%)
    category_score := LEAST((common_categories::FLOAT / GREATEST(array_length(p1_categories, 1), array_length(p2_categories, 1), 1)) * 30, 30);
  END IF;
  
  -- Rasgos de personalidad comunes (20%)
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
    
    trait_score := LEAST((common_traits::FLOAT / total_traits) * 20, 20);
  END IF;
  
  -- Compatibilidad de profundidad de conversación (20%)
  depth_compatibility := 20 - (ABS(p1_depth - p2_depth) * 2);
  depth_compatibility := GREATEST(depth_compatibility, 0);
  
  total_score := interest_score + category_score + trait_score + depth_compatibility;
  
  explanation := jsonb_build_object(
    'common_interests', common_interests,
    'common_categories', common_categories,
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

-- Actualizar función de matching específico (busco/ofrezco)
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
  category_matches_1to2 INT := 0;
  category_matches_2to1 INT := 0;
  total_category_matches INT := 0;
  complementary_matches INT := 0;
  total_score FLOAT := 0;
  explanation JSONB;
  is_bidirectional BOOLEAN := false;
  p1_seek_categories TEXT[];
  p2_offer_categories TEXT[];
  p2_seek_categories TEXT[];
  p1_offer_categories TEXT[];
BEGIN
  -- Lo que p1 busca y p2 ofrece (exacto)
  IF jsonb_typeof(p1_seeking) = 'array' AND jsonb_typeof(p2_offering) = 'array' AND
     jsonb_array_length(p1_seeking) > 0 AND jsonb_array_length(p2_offering) > 0 THEN
    SELECT COUNT(*) INTO p1_seeks_p2_offers
    FROM jsonb_array_elements_text(p1_seeking) AS s1
    INNER JOIN jsonb_array_elements_text(p2_offering) AS o2 ON s1 = o2;
    
    -- Matching por categorías (p1 busca -> p2 ofrece)
    SELECT ARRAY_AGG(DISTINCT get_tag_category(value::TEXT)) INTO p1_seek_categories
    FROM jsonb_array_elements_text(p1_seeking);
    
    SELECT ARRAY_AGG(DISTINCT get_tag_category(value::TEXT)) INTO p2_offer_categories
    FROM jsonb_array_elements_text(p2_offering);
    
    SELECT COUNT(*) INTO category_matches_1to2
    FROM unnest(p1_seek_categories) AS c1
    INNER JOIN unnest(p2_offer_categories) AS c2 ON c1 = c2;
  END IF;
  
  -- Lo que p2 busca y p1 ofrece (exacto)
  IF jsonb_typeof(p2_seeking) = 'array' AND jsonb_typeof(p1_offering) = 'array' AND
     jsonb_array_length(p2_seeking) > 0 AND jsonb_array_length(p1_offering) > 0 THEN
    SELECT COUNT(*) INTO p2_seeks_p1_offers
    FROM jsonb_array_elements_text(p2_seeking) AS s2
    INNER JOIN jsonb_array_elements_text(p1_offering) AS o1 ON s2 = o1;
    
    -- Matching por categorías (p2 busca -> p1 ofrece)
    SELECT ARRAY_AGG(DISTINCT get_tag_category(value::TEXT)) INTO p2_seek_categories
    FROM jsonb_array_elements_text(p2_seeking);
    
    SELECT ARRAY_AGG(DISTINCT get_tag_category(value::TEXT)) INTO p1_offer_categories
    FROM jsonb_array_elements_text(p1_offering);
    
    SELECT COUNT(*) INTO category_matches_2to1
    FROM unnest(p2_seek_categories) AS c1
    INNER JOIN unnest(p1_offer_categories) AS c2 ON c1 = c2;
  END IF;
  
  complementary_matches := p1_seeks_p2_offers + p2_seeks_p1_offers;
  total_category_matches := category_matches_1to2 + category_matches_2to1;
  
  -- Puntuación base por matches exactos (50%)
  total_score := LEAST(complementary_matches * 25, 50);
  
  -- Bonus por categorías comunes (50%)
  total_score := total_score + LEAST(total_category_matches * 25, 50);
  
  -- Bonus si es bidireccional (x1.3)
  is_bidirectional := ((p1_seeks_p2_offers > 0 OR category_matches_1to2 > 0) AND 
                       (p2_seeks_p1_offers > 0 OR category_matches_2to1 > 0));
  IF is_bidirectional THEN
    total_score := LEAST(total_score * 1.3, 100);
  END IF;
  
  explanation := jsonb_build_object(
    'you_seek_they_offer', p1_seeks_p2_offers,
    'they_seek_you_offer', p2_seeks_p1_offers,
    'category_matches_1to2', category_matches_1to2,
    'category_matches_2to1', category_matches_2to1,
    'bidirectional', is_bidirectional
  );
  
  RETURN QUERY SELECT total_score, explanation;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Verificar que las funciones se actualizaron
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
AND routine_name IN ('get_tag_category', 'match_affinity', 'match_specific')
ORDER BY routine_name;
