package dev.angelcorzo.nivo.api.specialpolicies.mapper;

import dev.angelcorzo.nivo.api.commons.config.MapperStructConfig;
import dev.angelcorzo.nivo.api.specialpolicies.dto.CreateSpecialPolicies;
import dev.angelcorzo.nivo.api.specialpolicies.dto.SpecialPoliciesDTO;
import dev.angelcorzo.nivo.model.specialpolicies.SpecialPolicies;
import dev.angelcorzo.nivo.usecase.createspecialpolicy.CreateSpecialPolicyUseCase;
import org.mapstruct.Mapper;

@Mapper(config = MapperStructConfig.class)
public interface SpecialPoliciesMapper {
  CreateSpecialPolicyUseCase.CreateSpecialPolicyCommand toModel(CreateSpecialPolicies dto);
  SpecialPoliciesDTO toDto(SpecialPolicies model);

}
