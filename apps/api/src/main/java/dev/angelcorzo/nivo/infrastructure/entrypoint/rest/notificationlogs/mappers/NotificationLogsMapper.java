package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.notificationlogs.mappers;

import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.commons.config.MapperStructConfig;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.notificationlogs.dto.NotificationLogsDTO;
import dev.angelcorzo.nivo.domain.model.notificationlogs.NotificationLogs;
import org.mapstruct.Mapper;

@Mapper(config = MapperStructConfig.class)
public interface NotificationLogsMapper {
  NotificationLogsDTO toDTO(NotificationLogs model);
}
