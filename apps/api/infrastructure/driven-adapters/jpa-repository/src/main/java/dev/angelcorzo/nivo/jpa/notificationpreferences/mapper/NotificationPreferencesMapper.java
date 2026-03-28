package dev.angelcorzo.nivo.jpa.notificationpreferences.mapper;

import dev.angelcorzo.nivo.jpa.config.MapperStructConfig;
import dev.angelcorzo.nivo.jpa.mappers.BaseMapper;
import dev.angelcorzo.nivo.jpa.notificationpreferences.NotificationPreferencesData;
import dev.angelcorzo.nivo.jpa.tenants.TenantsData;
import dev.angelcorzo.nivo.jpa.users.UsersData;
import dev.angelcorzo.nivo.model.notificationpreferences.NotificationPreferences;
import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.model.users.valueobject.UserReference;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * MapStruct mapper for converting between {@link NotificationPreferences} domain entity and
 * {@link NotificationPreferencesData} JPA entity.
 *
 * <p>Because the domain model uses the value objects {@link UserReference} and
 * {@link TenantReference} while the JPA entity holds full {@link UsersData} and
 * {@link TenantsData} associations, explicit {@link Mapping} annotations are required to
 * flatten and unflatten those nested structures.
 *
 * <p>Specifically:
 * <ul>
 *   <li>{@code toEntity}: maps {@code user.id}, {@code user.email}, etc. from the nested
 *       {@link UsersData} into the flat {@link UserReference} record, and similarly for tenant.
 *   <li>{@code toData}: constructs minimal {@link UsersData} / {@link TenantsData} stubs carrying
 *       only the FK id — sufficient for persistence without triggering lazy-load.
 * </ul>
 *
 * <p><strong>Layer:</strong> Infrastructure (Driven Adapter - Mapper)
 *
 * <p><strong>Responsibility:</strong> To facilitate data transfer between the domain and
 * persistence layers for Notification Preferences.
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see NotificationPreferences
 * @see NotificationPreferencesData
 * @see BaseMapper
 * @see MapperStructConfig
 */
@Mapper(config = MapperStructConfig.class)
public interface NotificationPreferencesMapper
    extends BaseMapper<NotificationPreferences, NotificationPreferencesData> {

  /**
   * Converts a {@link NotificationPreferencesData} JPA entity to a {@link NotificationPreferences}
   * domain entity.
   *
   * <p>The nested {@link UsersData} fields are projected into a {@link UserReference} value object,
   * and the nested {@link TenantsData} fields are projected into a {@link TenantReference} value
   * object.
   *
   * @param data The JPA entity.
   * @return The domain entity.
   */
  @Override
  @Mapping(target = "user.id", source = "user.id")
  @Mapping(target = "user.fullName", source = "user.fullName")
  @Mapping(target = "user.email", source = "user.email")
  @Mapping(target = "user.role", source = "user.role")
  @Mapping(target = "user.contactInfo", source = "user.contactInfo")
  @Mapping(target = "tenant.id", source = "tenant.id")
  @Mapping(target = "tenant.companyName", source = "tenant.companyName")
  NotificationPreferences toEntity(NotificationPreferencesData data);

  /**
   * Converts a {@link NotificationPreferences} domain entity to a
   * {@link NotificationPreferencesData} JPA entity.
   *
   * <p>Only the FK ids are mapped into the {@link UsersData} and {@link TenantsData} stubs —
   * this avoids unintended eager-loads and is sufficient for JPA to resolve the FK relationship
   * on persist/merge.
   *
   * @param entity The domain entity.
   * @return The JPA entity.
   */
  @Override
  @Mapping(target = "user.id", source = "user.id")
  @Mapping(target = "tenant.id", source = "tenant.id")
  NotificationPreferencesData toData(NotificationPreferences entity);
}
