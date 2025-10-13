-- Solo crear la tabla de validación (la tabla participants ya existe)

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
