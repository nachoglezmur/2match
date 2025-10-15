-- ============================================
-- CORREGIR POLÍTICAS DE MATCHES Y MESSAGES
-- ============================================

-- Eliminar políticas restrictivas de matches
DROP POLICY IF EXISTS "Allow public read on matches" ON matches;

-- Crear políticas permisivas para matches (desarrollo)
CREATE POLICY "Allow public all on matches" ON matches
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Asegurar que match_interactions también permite todo
DROP POLICY IF EXISTS "Allow public insert on match_interactions" ON match_interactions;

CREATE POLICY "Allow public all on match_interactions" ON match_interactions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verificar políticas
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('matches', 'match_interactions', 'messages')
ORDER BY tablename, policyname;
