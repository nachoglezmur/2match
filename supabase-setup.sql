-- Script de configuración para Supabase
-- Ejecuta este código en el SQL Editor de tu proyecto Supabase

-- ============================================
-- TABLA 1: PARTICIPANTES DEL EVENTO
-- ============================================
CREATE TABLE participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact TEXT NOT NULL,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('email', 'phone')),
  interests TEXT NOT NULL,
  looking_for_similar BOOLEAN DEFAULT true,
  bio TEXT NOT NULL,
  characteristics TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserciones públicas (para el formulario)
CREATE POLICY "Allow public inserts on participants" ON participants
  FOR INSERT
  WITH CHECK (true);

-- Política para permitir lecturas autenticadas (para administradores)
CREATE POLICY "Allow authenticated reads on participants" ON participants
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Índices para mejorar el rendimiento
CREATE INDEX idx_participants_created_at ON participants(created_at DESC);
CREATE INDEX idx_participants_contact_type ON participants(contact_type);


-- ============================================
-- TABLA 2: FEEDBACK DE VALIDACIÓN (The Mom Test)
-- ============================================
CREATE TABLE validation_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  attended_event TEXT,
  used_service TEXT,
  would_pay TEXT,
  max_price TEXT,
  main_problem TEXT,
  current_solution TEXT,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security
ALTER TABLE validation_feedback ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserciones públicas
CREATE POLICY "Allow public inserts on validation_feedback" ON validation_feedback
  FOR INSERT
  WITH CHECK (true);

-- Política para permitir lecturas autenticadas
CREATE POLICY "Allow authenticated reads on validation_feedback" ON validation_feedback
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Índices
CREATE INDEX idx_validation_feedback_created_at ON validation_feedback(created_at DESC);
CREATE INDEX idx_validation_feedback_email ON validation_feedback(email);
