-- Migration: V20
-- Creates a PostgreSQL trigger that automatically generates default notification preferences
-- for every user inserted into the `users` table (all event types × all channels).
-- Valid values are read dynamically from the CHECK constraints of `notification_preferences`,
-- so adding a new event_type or channel to those constraints is enough for the trigger to pick
-- it up automatically.
-- Also backfills preferences for users already seeded (V15.2).

-- ──────────────────────────────────────────────────────────────────────────────
-- Helper: extract allowed values from a column-level CHECK constraint
--
-- Reads pg_constraint for the given table/column and splits the IN(...) list.
-- Example: get_check_constraint_values('notification_preferences', 'channel')
--          → { 'EMAIL', 'WHATSAPP' }
-- ──────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_check_constraint_values(p_table TEXT, p_column TEXT)
    RETURNS TABLE
            (
                value TEXT
            )
    LANGUAGE sql
    STABLE
AS
$$
SELECT DISTINCT m[1] AS value
FROM pg_constraint c
         JOIN pg_class t ON c.conrelid = t.oid
         JOIN pg_namespace n ON n.oid = t.relnamespace
         JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY (c.conkey)
         CROSS JOIN LATERAL regexp_matches(pg_get_constraintdef(c.oid), '''([^'']+)''', 'g') AS m
WHERE c.contype = 'c'
  AND n.nspname = current_schema()
  AND t.relname = p_table
  AND a.attname = p_column
ORDER BY 1;
$$;

CREATE OR REPLACE FUNCTION create_default_notification_preferences()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
DECLARE
    v_event   TEXT;
    v_channel TEXT;
BEGIN
    IF NEW.tenant_id IS NULL THEN
        RETURN NEW;
    END IF;

    FOR v_event IN SELECT value FROM get_check_constraint_values('notification_preferences', 'event_type')
        LOOP
            FOR v_channel IN SELECT value FROM get_check_constraint_values('notification_preferences', 'channel')
                LOOP
                    INSERT INTO notification_preferences (id, user_id, tenant_id, event_type, channel, is_enabled,
                                                          created_at, updated_at)
                    VALUES (gen_random_uuid(), NEW.id, NEW.tenant_id, v_event, v_channel, TRUE,
                            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    ON CONFLICT (user_id, event_type, channel) DO NOTHING;
                END LOOP;
        END LOOP;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_default_notification_preferences ON users;

CREATE TRIGGER trg_user_default_notification_preferences
    AFTER INSERT
    ON users
    FOR EACH ROW
EXECUTE FUNCTION create_default_notification_preferences();

-- Backfill existing users with tenant context.
INSERT INTO notification_preferences (id, user_id, tenant_id, event_type, channel, is_enabled, created_at, updated_at)
SELECT gen_random_uuid(),
       u.id,
       u.tenant_id,
       e.value,
       c.value,
       TRUE,
       CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP
FROM users u
         CROSS JOIN get_check_constraint_values('notification_preferences', 'event_type') AS e
         CROSS JOIN get_check_constraint_values('notification_preferences', 'channel') AS c
WHERE u.tenant_id IS NOT NULL
ON CONFLICT (user_id, event_type, channel) DO NOTHING;
