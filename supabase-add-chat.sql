-- ============================================
-- AÑADIR FUNCIONALIDAD DE CHAT
-- ============================================

-- Crear tabla de mensajes
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_messages_match ON messages(match_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(match_id, read) WHERE read = false;

-- Habilitar RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Políticas para mensajes
CREATE POLICY "Allow users to read their match messages" ON messages
  FOR SELECT
  USING (
    match_id IN (
      SELECT id FROM matches 
      WHERE profile1_id IN (SELECT id FROM event_profiles WHERE user_id = auth.uid())
         OR profile2_id IN (SELECT id FROM event_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Allow users to send messages in their matches" ON messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    match_id IN (
      SELECT id FROM matches 
      WHERE profile1_id IN (SELECT id FROM event_profiles WHERE user_id = auth.uid())
         OR profile2_id IN (SELECT id FROM event_profiles WHERE user_id = auth.uid())
    )
  );

-- Política pública temporal para desarrollo (eliminar en producción)
CREATE POLICY "Allow public insert on messages" ON messages
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public read on messages" ON messages
  FOR SELECT
  USING (true);

-- Verificar que la tabla se creó
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;
