-- Script para agregar nuevos campos al perfil profesional del candidato
-- Historia de usuario: Perfil profesional candidato

-- 1. Agregar nuevas columnas a la tabla candidate
ALTER TABLE candidate 
ADD COLUMN professional_title VARCHAR(255),
ADD COLUMN years_experience INTEGER,
ADD COLUMN employment_status VARCHAR(50),
ADD COLUMN availability VARCHAR(50),
ADD COLUMN preferred_modality VARCHAR(50),
ADD COLUMN presentation TEXT,
ADD COLUMN github_profile VARCHAR(255);

-- 2. Crear tabla para la relación many-to-many entre candidate y tech_labels
CREATE TABLE candidate_tech_labels (
    id BIGSERIAL PRIMARY KEY,
    id_candidate INTEGER NOT NULL,
    id_tech_label BIGINT NOT NULL,
    CONSTRAINT FK_CANDIDATE_TECH_LABEL_CANDIDATE FOREIGN KEY (id_candidate) REFERENCES candidate(id) ON DELETE CASCADE,
    CONSTRAINT FK_CANDIDATE_TECH_LABEL_TECHLABEL FOREIGN KEY (id_tech_label) REFERENCES tech_labels(id) ON DELETE CASCADE,
    UNIQUE(id_candidate, id_tech_label)
);

-- 3. Crear índices para mejor rendimiento
CREATE INDEX idx_candidate_tech_labels_candidate ON candidate_tech_labels(id_candidate);
CREATE INDEX idx_candidate_tech_labels_tech_label ON candidate_tech_labels(id_tech_label);

-- 4. Comentarios para documentación
COMMENT ON COLUMN candidate.professional_title IS 'Título profesional del candidato';
COMMENT ON COLUMN candidate.years_experience IS 'Años de experiencia profesional';
COMMENT ON COLUMN candidate.employment_status IS 'Situación laboral actual (EMPLEADO, DESEMPLEADO, FREELANCE, ESTUDIANTE, BUSCA_ACTIVAMENTE)';
COMMENT ON COLUMN candidate.availability IS 'Disponibilidad para empezar (INMEDIATA, UNA_SEMANA, DOS_SEMANAS, UN_MES, MAS_DE_UN_MES)';
COMMENT ON COLUMN candidate.preferred_modality IS 'Modalidad de trabajo preferida (PRESENCIAL, REMOTO, HIBRIDO)';
COMMENT ON COLUMN candidate.presentation IS 'Presentación personal del candidato';
COMMENT ON COLUMN candidate.github_profile IS 'URL del perfil de GitHub del candidato';
COMMENT ON TABLE candidate_tech_labels IS 'Relación many-to-many entre candidatos y etiquetas tecnológicas (áreas de especialización)';
