package dev.angelcorzo.nivo.jpa.notificationlogs.mappers;

import dev.angelcorzo.nivo.jpa.config.MapperStructConfig;
import dev.angelcorzo.nivo.jpa.mappers.BaseMapper;
import dev.angelcorzo.nivo.jpa.notificationlogs.NotificationLogsData;
import dev.angelcorzo.nivo.jpa.notificationtemplates.NotificationTemplatesData;
import dev.angelcorzo.nivo.model.notificationlogs.NotificationLogs;
import java.util.UUID;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(config = MapperStructConfig.class)
public interface NotificationLogsMapper extends BaseMapper<NotificationLogs, NotificationLogsData> {

  @Override
  @Mapping(target = "templateId", source = "template.id")
  NotificationLogs toEntity(NotificationLogsData data);

  @Override
  @Mapping(target = "template", source = "templateId", qualifiedByName = "uuidToTemplate")
  NotificationLogsData toData(NotificationLogs entity);

  @Named("uuidToTemplate")
  default NotificationTemplatesData uuidToTemplate(UUID templateId) {
    if (templateId == null) return null;
    return NotificationTemplatesData.builder().id(templateId).build();
  }
}
