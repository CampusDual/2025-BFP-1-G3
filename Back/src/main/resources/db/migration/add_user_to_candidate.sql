-- Script para verificar la relación User-Candidate existente
-- Este script verifica que la relación ya existe en la base de datos

-- Verificar que existe la columna id_candidate en la tabla users
-- La relación ya existe: users.id_candidate -> candidate.id

-- Consulta para verificar la relación existente:
-- SELECT u.id, u.login, u.id_candidate, c.name, c.email 
-- FROM users u 
-- LEFT JOIN candidate c ON u.id_candidate = c.id 
-- WHERE u.id_candidate IS NOT NULL;

-- La seguridad ahora funciona de la siguiente manera:
-- 1. El token JWT contiene el username del usuario
-- 2. Se busca el User por login (username)
-- 3. Se obtiene el Candidate asociado desde user.getCandidate()
-- 4. Se usa el candidateId obtenido de forma segura

-- No se requieren cambios en la base de datos
-- La relación users.id_candidate -> candidate.id ya existe
