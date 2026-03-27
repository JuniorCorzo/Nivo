package dev.angelcorzo.nivo.jpa.specialpolicies.mappers;

import dev.angelcorzo.nivo.jpa.config.MapperStructConfig;
import dev.angelcorzo.nivo.jpa.mappers.BaseMapper;
import dev.angelcorzo.nivo.jpa.specialpolicies.SpecialPoliciesData;
import dev.angelcorzo.nivo.model.specialpolicies.SpecialPolicies;
import org.mapstruct.Mapper;

@Mapper(config = MapperStructConfig.class)
public interface SpecialPoliciesMapper extends BaseMapper<SpecialPolicies, SpecialPoliciesData> {}
