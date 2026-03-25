package dev.angelcorzo.neoparking.jpa.users;

import dev.angelcorzo.neoparking.jpa.helper.AdapterOperations;
import dev.angelcorzo.neoparking.jpa.users.mapper.UserMapper;
import dev.angelcorzo.neoparking.model.users.Users;
import dev.angelcorzo.neoparking.model.users.enums.Roles;
import dev.angelcorzo.neoparking.model.users.gateways.UsersRepository;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Example;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 * JPA adapter for {@link UsersRepository}.
 *
 * <p>This class implements the {@link UsersRepository} interface, providing concrete persistence
 * operations for {@link Users} entities using Spring Data JPA.
 *
 * <p>It extends {@link AdapterOperations} to leverage common CRUD and mapping functionalities.
 *
 * <p><strong>Layer:</strong> Infrastructure (Driven Adapter - JPA)
 *
 * <p><strong>Responsibility:</strong> To provide persistence implementation for User domain
 * operations.
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see UsersRepository
 * @see UsersData
 * @see UserMapper
 * @see AdapterOperations
 */
@Repository
public class UserRepositoryAdapter
    extends AdapterOperations<Users, UsersData, UUID, UserRepositoryData>
    implements UsersRepository {

  /**
   * Constructs a new UserRepositoryAdapter.
   *
   * @param repository The Spring Data JPA repository for UsersData.
   * @param mapper The MapStruct mapper for Users.
   */
  protected UserRepositoryAdapter(final UserRepositoryData repository, final UserMapper mapper) {
    super(repository, mapper);
  }

  /**
   * Finds a user by their email address.
   *
   * @param email The email address of the user.
   * @return An {@link Optional} containing the found {@link Users} entity, or empty if not found.
   */
  @Override
  public Optional<Users> findByEmail(String email) {
    return this.repository.findByEmail(email).map(super::toEntity);
  }

  /**
   * Finds a user by their unique identifier, eagerly fetching their associated tenant.
   *
   * @param id The unique identifier of the user.
   * @return An {@link Optional} containing the found {@link Users} entity with tenant, or empty if
   *     not found.
   */
  @Override
  public Optional<Users> findById(UUID id) {
    Optional<UsersData> byIdFetchTenant = this.repository.findByIdFetchTenant(id);
    return byIdFetchTenant.map(super::toEntity);
  }

  /**
   * Finds a user by their ID and tenant ID, eagerly fetching the tenant.
   *
   * @param id The unique identifier of the user.
   * @param tenantId The unique identifier of the tenant.
   * @return An {@link Optional} containing the found {@link Users} entity with tenant, or empty if
   *     not found or not in the tenant.
   */
  @Override
  public Optional<Users> findByIdAndTenantId(UUID id, UUID tenantId) {
    return this.repository.findByIdAndTenant_Id(id, tenantId).map(super::toEntity);
  }

  @Override
  @Transactional(readOnly = true)
  public Users getReferenceById(UUID id) {
    return super.mapper.toEntity(super.repository.getReferenceById(id));
  }

  /**
   * Saves (creates or updates) a user entity. After saving, it re-fetches the user to ensure the
   * associated tenant is loaded.
   *
   * @param entity The {@link Users} entity to save.
   * @return The saved {@link Users} entity with its tenant loaded.
   */
  @Override
  public Users save(Users entity) {
    final Users userCreated = super.save(entity);
    return findById(userCreated.getId()).orElseThrow();
  }

  /**
   * Counts the number of active users with the 'OWNER' role within a specific tenant.
   *
   * @param tenantId The unique identifier of the tenant.
   * @return The total count of active owners.
   */
  @Override
  public Long countActiveOwnersByTenantId(UUID tenantId) {
    return this.repository.countByRoleAndTenantId(Roles.OWNER, tenantId);
  }

  /**
   * Checks if a user with the given ID exists.
   *
   * @param id The unique identifier of the user to check.
   * @return {@code true} if a user with the specified ID exists, {@code false} otherwise.
   */
  @Override
  public Boolean existsById(UUID id) {
    return this.repository.existsById(id);
  }

  @Override
  public Boolean existsByIdAndTenantId(UUID id, UUID tenantId) {
    return this.repository.existsByIdAndTenantId(id, tenantId);
  }

  /**
   * Checks if a user with the given email address exists.
   *
   * @param email The email address to check.
   * @return {@code true} if a user with the specified email exists, {@code false} otherwise.
   */
  @Override
  public Boolean existsByEmail(String email) {
    Example<UsersData> filterEmail = Example.of(UsersData.builder().email(email).build());

    return this.repository.exists(filterEmail);
  }

  /**
   * Checks if a user with the given email address exists within a specific tenant.
   *
   * @param email The email address to check.
   * @param tenantId The unique identifier of the tenant.
   * @return {@code true} if a user with the specified email exists in the tenant, {@code false}
   *     otherwise.
   */
  @Override
  public Boolean existsByEmailAndTenantId(String email, UUID tenantId) {
    return this.repository.existsByEmailAndTenantId(email, tenantId);
  }

  /**
   * Assigns a user to a specific tenant. This is typically used when an existing user is invited to
   * a new tenant.
   *
   * @param userId The unique identifier of the user to assign.
   * @param tenantId The unique identifier of the tenant to assign the user to.
   * @return The number of rows affected by the update.
   */
  @Override
  public int assignTenant(UUID userId, UUID tenantId) {
    return this.repository.assignTenant(userId, tenantId);
  }

  /**
   * Deletes a user by their unique identifier.
   *
   * @param id The unique identifier of the user to delete.
   */
  @Override
  public void deleteById(UUID id) {
    this.repository.deleteById(id);
  }
}
