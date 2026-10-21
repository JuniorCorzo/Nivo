package dev.angelcorzo.nivo.infrastructure.adapter.jpa.tenants;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * JPA Repository for {@link TenantsData} entities.
 *
 * <p>This interface extends Spring Data JPA's {@link JpaRepository} to provide
 * standard CRUD operations and querying capabilities for Tenant data.</p>
 *
 * <p><strong>Layer:</strong> Infrastructure (Driven Adapter - JPA Repository)</p>
 * <p><strong>Responsibility:</strong> To interact with the database for Tenant persistence.</p>
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see TenantsData
 */
public interface TenantsRepositoryData extends JpaRepository<TenantsData, UUID> {}
