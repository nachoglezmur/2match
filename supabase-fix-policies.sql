-- ============================================
-- CORREGIR POLÍTICAS RLS
-- ============================================

-- Eliminar políticas existentes que causan conflicto
DROP POLICY IF EXISTS "Allow public insert on users" ON users;
DROP POLICY IF EXISTS "Allow public read on users" ON users;
DROP POLICY IF EXISTS "Allow public insert on event_profiles" ON event_profiles;
DROP POLICY IF EXISTS "Allow public read on event_profiles" ON event_profiles;

-- Crear políticas que permitan INSERT y UPDATE
CREATE POLICY "Allow public insert and update on users" ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public all on event_profiles" ON event_profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verificar políticas
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('users', 'event_profiles')
ORDER BY tablename, policyname;
