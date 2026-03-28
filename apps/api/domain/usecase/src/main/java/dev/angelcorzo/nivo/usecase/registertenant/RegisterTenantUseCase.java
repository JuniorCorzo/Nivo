package dev.angelcorzo.nivo.usecase.registertenant;

import dev.angelcorzo.nivo.model.tenants.Tenants;
import dev.angelcorzo.nivo.model.tenants.gateways.TenantsRepository;
import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import dev.angelcorzo.nivo.model.users.exceptions.EmailAlreadyExistsException;
import dev.angelcorzo.nivo.model.users.gateways.PasswordEncodeGateway;
import dev.angelcorzo.nivo.model.users.gateways.UsersRepository;
import dev.angelcorzo.nivo.usecase.notifications.RegistrationNotifier;
import lombok.RequiredArgsConstructor;

/**
 * Use case for registering a new tenant and an initial owner user.
 *
 * <p>This class handles the business logic for creating a new tenant, associating an owner user
 * with it, and ensuring data integrity.
 *
 * <p><strong>Layer:</strong> Application (Use Case)
 *
 * <p><strong>Responsibility:</strong> To manage the registration process of a new tenant.
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see Tenants
 * @see Users
 */
@RequiredArgsConstructor
public class RegisterTenantUseCase {
  private final UsersRepository usersRepository;
  private final TenantsRepository tenantsRepository;
  private final PasswordEncodeGateway passwordEncode;
  private final RegistrationNotifier registrationNotifier;

  /**
   * Registers a new tenant and creates an associated owner user.
   *
   * @param user The initial {@link Users} object for the tenant owner.
   * @param tenant The {@link Tenants} object representing the new tenant.
   * @return The newly created {@link Users} object for the tenant owner, now associated with the
   *     tenant.
   * @throws EmailAlreadyExistsException if the email of the provided user already exists in the
   *     system.
   */
  public Users register(Users user, final Tenants tenant) {
    this.validateEmailExists(user);

    final Tenants tenantCreated = this.tenantsRepository.save(tenant);

    final String passwordEncrypted = this.passwordEncode.encrypt(user.getPassword());
    user.setTenant(
        TenantReference.of(this.tenantsRepository.getReferenceById(tenantCreated.getId())));
    user.setRole(Roles.OWNER);
    user.setPassword(passwordEncrypted);
    user = this.usersRepository.save(user);

    this.registrationNotifier.notifyUserSelfRegistered(user);
    return user;
  }

  /**
   * Validates if the email of the provided user already exists in the system.
   *
   * @param user The {@link Users} object whose email is to be validated.
   * @throws EmailAlreadyExistsException if the email already exists.
   */
  private void validateEmailExists(Users user) {
    final String email = user.getEmail();
    if (this.usersRepository.existsByEmail(email)) {
      throw new EmailAlreadyExistsException(email);
    }
  }
}
