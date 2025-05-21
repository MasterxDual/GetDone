-- MIGRACIÓN PARA LA TABLA USERS - GETDONE
-- Este script realiza las siguientes modificaciones:
-- 1. Renombra columnas a inglés para consistencia
-- 2. Añade columna para roles de usuario
-- 3. Agrega restricciones de integridad

BEGIN;

-- 1. Renombrar columnas existentes
ALTER TABLE users RENAME COLUMN nombre TO first_name;
ALTER TABLE users RENAME COLUMN apellido TO last_name;

-- 2. Añadir nueva columna para roles con valor por defecto 'user'
-- ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user';

-- 3. Agregar restricción UNIQUE al email (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_email_unique'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
    END IF;
END $$;

-- 4. Establecer valores por defecto para nombres
ALTER TABLE users ALTER COLUMN first_name SET DEFAULT '';
ALTER TABLE users ALTER COLUMN last_name SET DEFAULT '';

-- 5. Asegurar que first_name no sea nulo (si es requerido)
ALTER TABLE users ALTER COLUMN first_name SET NOT NULL;

COMMIT;

-- Verificación final (opcional)
COMMENT ON TABLE users IS 'Tabla de usuarios con estructura internacionalizada';