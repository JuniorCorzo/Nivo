package dev.angelcorzo.nivo.infrastructure.adapter.jpa.notificationtemplates.mappers;

import dev.angelcorzo.nivo.infrastructure.adapter.jpa.config.MapperStructConfig;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.mappers.BaseMapper;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.notificationtemplates.NotificationTemplatesData;
import dev.angelcorzo.nivo.domain.model.notificationtemplates.NotificationTemplates;
import org.mapstruct.Mapper;

@Mapper(config = MapperStructConfig.class)
public interface NotificationTemplateMapper
    extends BaseMapper<NotificationTemplates, NotificationTemplatesData> {}
