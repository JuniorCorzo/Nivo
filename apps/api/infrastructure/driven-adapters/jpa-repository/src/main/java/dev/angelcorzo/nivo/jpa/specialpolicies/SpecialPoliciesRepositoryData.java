package dev.angelcorzo.nivo.jpa.specialpolicies;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SpecialPoliciesRepositoryData extends JpaRepository<SpecialPoliciesData, UUID> {
  List<SpecialPoliciesData> findAllByTenant_Id(UUID tenantId);
}
