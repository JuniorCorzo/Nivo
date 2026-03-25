package dev.angelcorzo.neoparking.api.notificationpreferences.mappers;

import dev.angelcorzo.neoparking.api.commons.config.MapperStructConfig;
import dev.angelcorzo.neoparking.api.notificationpreferences.dto.NotificationPreferencesDTO;
import dev.angelcorzo.neoparking.model.notificationpreferences.NotificationPreferences;
import org.mapstruct.Mapper;

/**
 * MapStruct mapper for converting a {@link NotificationPreferences} domain entity to a
 * {@link NotificationPreferencesDTO} response payload.
 *
 * <p>All fields map directly by name — no flattening or unflattening is required at the REST
 * boundary because both types share the same nested value-object structure
 * ({@code UserReference}, {@code TenantReference}).
 *
 * <p><strong>Layer:</strong> Infrastructure (Entry Point - REST)
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
@Mapper(config = MapperStructConfig.class)
public interface NotificationPreferencesMapper {

  /**
   * Converts a {@link NotificationPreferences} domain entity to its REST response DTO.
   *
   * @param model The domain entity.
   * @return The response DTO.
   */
  NotificationPreferencesDTO toDTO(NotificationPreferences model);
}
