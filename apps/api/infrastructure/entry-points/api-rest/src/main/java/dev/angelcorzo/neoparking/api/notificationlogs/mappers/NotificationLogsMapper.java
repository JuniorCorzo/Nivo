package dev.angelcorzo.neoparking.api.notificationlogs.mappers;

import dev.angelcorzo.neoparking.api.commons.config.MapperStructConfig;
import dev.angelcorzo.neoparking.api.notificationlogs.dto.NotificationLogsDTO;
import dev.angelcorzo.neoparking.model.notificationlogs.NotificationLogs;
import org.mapstruct.Mapper;

@Mapper(config = MapperStructConfig.class)
public interface NotificationLogsMapper {
  NotificationLogsDTO toDTO(NotificationLogs model);
}
