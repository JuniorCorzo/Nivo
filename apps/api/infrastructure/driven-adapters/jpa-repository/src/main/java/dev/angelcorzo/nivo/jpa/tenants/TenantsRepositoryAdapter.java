package dev.angelcorzo.nivo.jpa.tenants;

import dev.angelcorzo.nivo.jpa.helper.AdapterOperations;
import dev.angelcorzo.nivo.jpa.tenants.mappers.TenantsMapper;
import dev.angelcorzo.nivo.model.tenants.Tenants;
import dev.angelcorzo.nivo.model.tenants.gateways.TenantsRepository;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 * JPA adapter for {@link TenantsRepository}.
 *
 * <p>This class implements the {@link TenantsRepository} interface, providing concrete persistence
 * operations for {@link Tenants} entities using Spring Data JPA.
 *
 * <p>It extends {@link AdapterOperations} to leverage common CRUD and mapping functionalities.
 *
 * <p><strong>Layer:</strong> Infrastructure (Driven Adapter - JPA)
 *
 * <p><strong>Responsibility:</strong> To provide persistence implementation for Tenant domain
 * operations.
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see TenantsRepository
 * @see TenantsData
 * @see TenantsMapper
 * @see AdapterOperations
 */
@Repository
public class TenantsRepositoryAdapter
    extends AdapterOperations<Tenants, TenantsData, UUID, TenantsRepositoryData>
    implements TenantsRepository {

  /**
   * Constructs a new TenantsRepositoryAdapter.
   *
   * @param repository The Spring Data JPA repository for TenantsData.
   * @param mapper The MapStruct mapper for Tenants.
   */
  protected TenantsRepositoryAdapter(TenantsRepositoryData repository, TenantsMapper mapper) {
    super(repository, mapper);
  }

  @Override
  @Transactional(readOnly = true)
  public Tenants getReferenceById(UUID id) {
    return super.mapper.toEntity(super.repository.getReferenceById(id));
  }

  /**
   * Checks if a tenant with the given ID exists in the database.
   *
   * @param id The unique identifier of the tenant.
   * @return {@code true} if a tenant with the specified ID exists, {@code false} otherwise.
   */
  @Override
  public Boolean existsById(UUID id) {
    return this.repository.existsById(id);
  }

  /**
   * Deletes a tenant by its unique identifier from the database.
   *
   * @param id The unique identifier of the tenant to delete.
   */
  @Override
  public void deleteById(UUID id) {
    this.repository.deleteById(id);
  }
}
