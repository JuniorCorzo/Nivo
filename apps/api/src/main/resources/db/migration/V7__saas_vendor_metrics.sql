-- Migration: V7__saas_vendor_metrics.sql
-- Materialized view for SaaS Tenant Economics & Observability Metrics

CREATE MATERIALIZED VIEW IF NOT EXISTS nivo.mv_saas_tenant_economics AS
WITH tenant_lots AS (
    SELECT
        p.tenant_id,
        COUNT(p.id) AS active_lots
    FROM nivo.parking_lots p
    WHERE p.deleted_at IS NULL
    GROUP BY p.tenant_id
),
tenant_slots AS (
    SELECT
        s.tenant_id,
        COUNT(s.id) AS total_slots
    FROM nivo.slots s
    WHERE s.deleted_at IS NULL
    GROUP BY s.tenant_id
),
tenant_monthly_tickets AS (
    SELECT
        pt.tenant_id,
        COUNT(pt.id) AS total_tickets_monthly
    FROM nivo.parking_tickets pt
    WHERE pt.deleted_at IS NULL
      AND pt.created_at >= (CURRENT_TIMESTAMP - INTERVAL '30 days')
    GROUP BY pt.tenant_id
),
tenant_first_ticket AS (
    SELECT
        pt.tenant_id,
        MIN(pt.entry_time) AS first_ticket_time
    FROM nivo.parking_tickets pt
    WHERE pt.deleted_at IS NULL
    GROUP BY pt.tenant_id
),
tenant_monthly_gmv AS (
    SELECT
        pay.tenant_id,
        COALESCE(SUM(pay.amount), 0) AS gmv_monthly
    FROM nivo.payments pay
    WHERE pay.deleted_at IS NULL
      AND pay.status = 'PAID'
      AND pay.created_at >= (CURRENT_TIMESTAMP - INTERVAL '30 days')
    GROUP BY pay.tenant_id
)
SELECT
    t.id AS tenant_id,
    t.company_name AS tenant_name,
    t.created_at AS registration_date,
    COALESCE(tl.active_lots, 0)::BIGINT AS active_lots,
    COALESCE(ts.total_slots, 0)::BIGINT AS total_slots,
    COALESCE(tg.gmv_monthly, 0.00)::NUMERIC(12, 2) AS gmv_monthly,
    COALESCE(tmt.total_tickets_monthly, 0)::BIGINT AS total_tickets_monthly,
    CASE
        WHEN tft.first_ticket_time IS NOT NULL AND tft.first_ticket_time >= t.created_at
        THEN ROUND((EXTRACT(EPOCH FROM (tft.first_ticket_time - t.created_at)) / 86400.0)::NUMERIC, 2)
        WHEN tft.first_ticket_time IS NOT NULL AND tft.first_ticket_time < t.created_at
        THEN 0.00
        ELSE NULL
    END AS time_to_first_value
FROM nivo.tenants t
LEFT JOIN tenant_lots tl ON t.id = tl.tenant_id
LEFT JOIN tenant_slots ts ON t.id = ts.tenant_id
LEFT JOIN tenant_monthly_tickets tmt ON t.id = tmt.tenant_id
LEFT JOIN tenant_first_ticket tft ON t.id = tft.tenant_id
LEFT JOIN tenant_monthly_gmv tg ON t.id = tg.tenant_id
WHERE t.deleted_at IS NULL;

-- Unique index required for CONCURRENT refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_saas_tenant_economics_tenant_id
    ON nivo.mv_saas_tenant_economics (tenant_id);

-- Function to refresh materialized view concurrently
CREATE OR REPLACE FUNCTION nivo.refresh_saas_tenant_economics()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY nivo.mv_saas_tenant_economics;
END;
$$;
