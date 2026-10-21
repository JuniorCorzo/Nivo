package dev.angelcorzo.nivo.infrastructure.adapter.jpa.specialpolicies.mappers;

import dev.angelcorzo.nivo.domain.model.specialpolicies.SpecialPolicies;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.config.MapperStructConfig;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.mappers.BaseMapper;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.specialpolicies.SpecialPoliciesData;
import org.mapstruct.Mapper;

@Mapper(config = MapperStructConfig.class)
public interface SpecialPoliciesMapper extends BaseMapper<SpecialPolicies, SpecialPoliciesData> {
}
