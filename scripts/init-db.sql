-- Script de inicialización de base de datos PostgreSQL para LLuminata
-- Este script se ejecuta automáticamente cuando se crea el contenedor de PostgreSQL

-- Configurar encoding y locale
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Configurar parámetros de rendimiento
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET pg_stat_statements.track = 'all';
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Crear usuario para la aplicación (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'inclusive_app') THEN
        CREATE ROLE inclusive_app WITH LOGIN PASSWORD 'inclusive123';
    END IF;
END
$$;

-- Otorgar permisos al usuario de la aplicación
GRANT CONNECT ON DATABASE inclusive_ai TO inclusive_app;
GRANT USAGE ON SCHEMA public TO inclusive_app;
GRANT CREATE ON SCHEMA public TO inclusive_app;

-- Configurar políticas de seguridad
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO inclusive_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO inclusive_app;

-- Crear índices de rendimiento para consultas frecuentes
-- (Estos se crearán automáticamente cuando Prisma genere las tablas)

-- Configurar autovacuum para mantenimiento automático
ALTER SYSTEM SET autovacuum = on;
ALTER SYSTEM SET autovacuum_max_workers = 3;
ALTER SYSTEM SET autovacuum_naptime = '1min';
ALTER SYSTEM SET autovacuum_vacuum_threshold = 50;
ALTER SYSTEM SET autovacuum_analyze_threshold = 50;

-- Configurar WAL para mejor rendimiento
ALTER SYSTEM SET wal_level = replica;
ALTER SYSTEM SET max_wal_senders = 3;
ALTER SYSTEM SET wal_keep_segments = 32;

-- Configurar conexiones
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';

-- Configurar logging
ALTER SYSTEM SET log_destination = 'stderr';
ALTER SYSTEM SET logging_collector = on;
ALTER SYSTEM SET log_directory = 'log';
ALTER SYSTEM SET log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log';
ALTER SYSTEM SET log_rotation_age = '1d';
ALTER SYSTEM SET log_rotation_size = '100MB';
ALTER SYSTEM SET log_min_messages = 'warning';
ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';

-- Crear función para limpiar logs antiguos
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
    -- Eliminar logs más antiguos de 30 días
    DELETE FROM pg_stat_statements WHERE calls = 0;
    
    -- Vacuum para liberar espacio
    VACUUM ANALYZE;
END;
$$ LANGUAGE plpgsql;

-- Crear función para obtener estadísticas de rendimiento
CREATE OR REPLACE FUNCTION get_performance_stats()
RETURNS TABLE (
    metric_name text,
    metric_value text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'total_connections'::text, count(*)::text FROM pg_stat_activity
    UNION ALL
    SELECT 'active_connections'::text, count(*)::text FROM pg_stat_activity WHERE state = 'active'
    UNION ALL
    SELECT 'idle_connections'::text, count(*)::text FROM pg_stat_activity WHERE state = 'idle'
    UNION ALL
    SELECT 'database_size'::text, pg_size_pretty(pg_database_size(current_database()))::text
    UNION ALL
    SELECT 'cache_hit_ratio'::text, 
           round(100.0 * sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)), 2)::text
    FROM pg_statio_user_tables;
END;
$$ LANGUAGE plpgsql;

-- Crear función para monitorear consultas lentas
CREATE OR REPLACE FUNCTION get_slow_queries(threshold_ms integer DEFAULT 1000)
RETURNS TABLE (
    query text,
    calls bigint,
    total_time double precision,
    mean_time double precision,
    rows bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows
    FROM pg_stat_statements 
    WHERE mean_time > threshold_ms
    ORDER BY mean_time DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Crear índices para optimizar consultas comunes
-- (Estos se crearán después de que Prisma genere las tablas)

-- Configurar triggers para auditoría (opcional)
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.created_at = COALESCE(NEW.created_at, NOW());
        NEW.updated_at = COALESCE(NEW.updated_at, NOW());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        NEW.updated_at = NOW();
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Crear tabla de auditoría
CREATE TABLE IF NOT EXISTS audit_log (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_name text NOT NULL,
    operation text NOT NULL,
    old_data jsonb,
    new_data jsonb,
    user_id text,
    timestamp timestamptz DEFAULT NOW()
);

-- Función para registrar cambios en auditoría
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, operation, new_data, user_id)
        VALUES (TG_TABLE_NAME, 'INSERT', to_jsonb(NEW), current_setting('app.current_user_id', true));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, operation, old_data, new_data, user_id)
        VALUES (TG_TABLE_NAME, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), current_setting('app.current_user_id', true));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, operation, old_data, user_id)
        VALUES (TG_TABLE_NAME, 'DELETE', to_jsonb(OLD), current_setting('app.current_user_id', true));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Crear índices para auditoría
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_operation ON audit_log(operation);

-- Configurar particionamiento para auditoría (para tablas grandes)
-- CREATE TABLE audit_log_2024 PARTITION OF audit_log
-- FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Crear vistas útiles para monitoreo
CREATE OR REPLACE VIEW database_stats AS
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public'
ORDER BY tablename, attname;

CREATE OR REPLACE VIEW table_sizes AS
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Configurar backup automático (cron job se configurará externamente)
-- 0 2 * * * /usr/local/bin/backup-postgresql.sh --compress

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Base de datos PostgreSQL inicializada correctamente para LLuminata';
    RAISE NOTICE 'Configuración optimizada para producción aplicada';
    RAISE NOTICE 'Extensiones y funciones de monitoreo instaladas';
END
$$;
