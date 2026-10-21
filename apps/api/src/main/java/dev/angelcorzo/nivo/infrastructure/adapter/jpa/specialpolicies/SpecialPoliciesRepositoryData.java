package dev.angelcorzo.nivo.infrastructure.adapter.jpa.specialpolicies;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpecialPoliciesRepositoryData extends JpaRepository<SpecialPoliciesData, UUID> {
    List<SpecialPoliciesData> findAllByTenant_Id(UUID tenantId);
}
