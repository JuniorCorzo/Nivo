package dev.angelcorzo.nivo.jpa.userinvitation;

import dev.angelcorzo.nivo.jpa.helper.AdapterOperations;
import dev.angelcorzo.nivo.jpa.userinvitation.mapper.UserInvitationsMapper;
import dev.angelcorzo.nivo.model.userinvitations.UserInvitations;
import dev.angelcorzo.nivo.model.userinvitations.gateways.UserInvitationsRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class UserInvitationsRepositoryAdapter
    extends AdapterOperations<
        UserInvitations, UserInvitationsData, UUID, UserInvitationsRepositoryData>
    implements UserInvitationsRepository {

  protected UserInvitationsRepositoryAdapter(
      UserInvitationsRepositoryData repository, UserInvitationsMapper mapper) {
    super(repository, mapper);
  }

  @Override
  public List<UserInvitations> findAllInvitationsByTenantId(UUID tenantId) {
    return this.repository.findAllByTenantId(tenantId).stream().map(super::toEntity).toList();
  }

  @Override
  public Optional<UserInvitations> findByToken(UUID token) {
    return this.repository.findByToken(token).map(super::toEntity);
  }

  @Override
  public UserInvitations save(UserInvitations entity) {
    UserInvitations userInvitationCreated = super.save(entity);

    return this.findById(userInvitationCreated.getId()).orElseThrow();
  }

  @Override
  public UserInvitations acceptedInvitation(UUID id) {
    this.repository.acceptedInvitation(id);

    return this.findById(id).orElseThrow();
  }

  @Override
  public Boolean revokeInvitation(UUID id) {
    return this.repository.revokeInvitation(id) == 1;
  }
}
