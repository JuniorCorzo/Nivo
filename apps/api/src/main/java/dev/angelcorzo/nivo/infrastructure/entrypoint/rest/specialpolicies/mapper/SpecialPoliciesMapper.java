package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.specialpolicies.mapper;

import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.config.MapperStructConfig;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.specialpolicies.dto.CreateSpecialPolicies;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.specialpolicies.dto.SpecialPoliciesDTO;
import dev.angelcorzo.nivo.domain.model.specialpolicies.SpecialPolicies;
import dev.angelcorzo.nivo.domain.usecase.policy.CreateSpecialPolicyUseCase;
import org.mapstruct.Mapper;

@Mapper(config = MapperStructConfig.class)
public interface SpecialPoliciesMapper {
  CreateSpecialPolicyUseCase.CreateSpecialPolicyCommand toModel(CreateSpecialPolicies dto);
  SpecialPoliciesDTO toDto(SpecialPolicies model);

}
