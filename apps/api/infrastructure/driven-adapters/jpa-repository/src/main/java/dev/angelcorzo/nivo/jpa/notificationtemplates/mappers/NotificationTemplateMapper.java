package dev.angelcorzo.nivo.jpa.notificationtemplates.mappers;

import dev.angelcorzo.nivo.jpa.config.MapperStructConfig;
import dev.angelcorzo.nivo.jpa.mappers.BaseMapper;
import dev.angelcorzo.nivo.jpa.notificationtemplates.NotificationTemplatesData;
import dev.angelcorzo.nivo.model.notificationtemplates.NotificationTemplates;
import org.mapstruct.Mapper;

@Mapper(config = MapperStructConfig.class)
public interface NotificationTemplateMapper
    extends BaseMapper<NotificationTemplates, NotificationTemplatesData> {}
