package dev.angelcorzo.nivo.api.notificationlogs.mappers;

import dev.angelcorzo.nivo.api.commons.config.MapperStructConfig;
import dev.angelcorzo.nivo.api.notificationlogs.dto.NotificationLogsDTO;
import dev.angelcorzo.nivo.model.notificationlogs.NotificationLogs;
import org.mapstruct.Mapper;

@Mapper(config = MapperStructConfig.class)
public interface NotificationLogsMapper {
  NotificationLogsDTO toDTO(NotificationLogs model);
}
