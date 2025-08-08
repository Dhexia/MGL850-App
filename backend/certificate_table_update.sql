-- Ajouter la colonne certificate_type à la table certificates
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS certificate_type text DEFAULT 'technical';

-- Ajouter une contrainte pour les types valides
ALTER TABLE certificates ADD CONSTRAINT IF NOT EXISTS valid_certificate_type 
CHECK (certificate_type IN ('safety', 'insurance', 'technical', 'inspection'));

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_type ON certificates(certificate_type);