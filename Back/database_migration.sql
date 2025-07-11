-- Script para cambiar el tipo de columna type de work_type_enum a VARCHAR(10)
-- con CHECK constraint para validar los valores permitidos

-- Paso 1: Eliminar la columna actual (si tiene datos, hay que respaldarlos primero)
-- IMPORTANTE: Este comando borrará los datos existentes en la columna type
-- Si hay datos importantes, hacer un backup primero

-- Opción A: Eliminar y recrear la columna (BORRA LOS DATOS)
ALTER TABLE offers DROP COLUMN IF EXISTS type;

-- Paso 2: Agregar la nueva columna como VARCHAR con CHECK constraint
ALTER TABLE offers ADD COLUMN type VARCHAR(10) 
  CHECK (type IN ('remote', 'hybrid', 'onsite')) 
  DEFAULT 'remote';

-- Opción B: Si queremos preservar datos existentes (más complejo):
-- 1. Crear columna temporal
-- ALTER TABLE offers ADD COLUMN type_temp VARCHAR(10);
-- 2. Migrar datos existentes
-- UPDATE offers SET type_temp = type::text;
-- 3. Eliminar columna original
-- ALTER TABLE offers DROP COLUMN type;
-- 4. Renombrar columna temporal
-- ALTER TABLE offers RENAME COLUMN type_temp TO type;
-- 5. Agregar constraint
-- ALTER TABLE offers ADD CONSTRAINT check_work_type CHECK (type IN ('remote', 'hybrid', 'onsite'));
-- 6. Establecer valor por defecto
-- ALTER TABLE offers ALTER COLUMN type SET DEFAULT 'remote';

-- Paso 3: Eliminar el enum type si ya no se usa en ninguna otra tabla
-- DROP TYPE IF EXISTS work_type_enum;

-- Verificar la estructura de la tabla
-- \d offers;
