package dev.angelcorzo.neoparking.jpa.notificationtemplates.mappers;

import dev.angelcorzo.neoparking.jpa.config.MapperStructConfig;
import dev.angelcorzo.neoparking.jpa.mappers.BaseMapper;
import dev.angelcorzo.neoparking.jpa.notificationtemplates.NotificationTemplatesData;
import dev.angelcorzo.neoparking.model.notificationtemplates.NotificationTemplates;
import org.mapstruct.Mapper;

@Mapper(config = MapperStructConfig.class)
public interface NotificationTemplateMapper
    extends BaseMapper<NotificationTemplates, NotificationTemplatesData> {}
