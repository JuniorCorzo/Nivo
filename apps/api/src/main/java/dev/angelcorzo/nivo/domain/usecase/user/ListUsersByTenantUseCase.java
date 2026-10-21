package dev.angelcorzo.nivo.domain.usecase.user;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.users.Users;
import dev.angelcorzo.nivo.domain.model.users.gateways.UsersRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

/**
 * Use case for retrieving all users belonging to the currently authenticated tenant.
 *
 * <p>
 * <strong>Layer:</strong> Application (Use Case)
 * </p>
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
@RequiredArgsConstructor
public class ListUsersByTenantUseCase {
    private final UsersRepository usersRepository;
    private final AuthenticationContextGateway authenticationContextGateway;

    public List<Users> execute() {
        final UUID tenantId = this.authenticationContextGateway.getCurrentTenantId();
        return this.usersRepository.findAllByTenantId(tenantId);
    }
}
