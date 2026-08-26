package dev.angelcorzo.nivo.jpa.userinvitation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.jpa.userinvitation.mapper.UserInvitationsMapper;
import dev.angelcorzo.nivo.model.userinvitations.UserInvitationStatus;
import dev.angelcorzo.nivo.model.userinvitations.UserInvitations;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("UserInvitationsRepositoryAdapter Unit Tests")
class UserInvitationsRepositoryAdapterTest {

  private UserInvitationsRepositoryData repository;
  private UserInvitationsMapper mapper;
  private UserInvitationsRepositoryAdapter adapter;

  @BeforeEach
  void setUp() {
    repository = mock(UserInvitationsRepositoryData.class);
    mapper = mock(UserInvitationsMapper.class);
    adapter = new UserInvitationsRepositoryAdapter(repository, mapper);
  }

  @Test
  @DisplayName("Should find all invitations by tenant ID")
  void shouldFindAllByTenantId() {
    UUID tenantId = UUID.randomUUID();
    UserInvitationsData data = new UserInvitationsData();
    UserInvitations entity = UserInvitations.builder().id(UUID.randomUUID()).build();

    when(repository.findAllByTenantId(tenantId)).thenReturn(List.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    List<UserInvitations> result = adapter.findAllInvitationsByTenantId(tenantId);

    assertThat(result).hasSize(1);
    assertThat(result.get(0)).isEqualTo(entity);
  }

  @Test
  @DisplayName("Should find invitation by token")
  void shouldFindByToken() {
    UUID token = UUID.randomUUID();
    UserInvitationsData data = new UserInvitationsData();
    UserInvitations entity = UserInvitations.builder().id(UUID.randomUUID()).token(token).build();

    when(repository.findByToken(token)).thenReturn(Optional.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    Optional<UserInvitations> result = adapter.findByToken(token);

    assertThat(result).isPresent();
    assertThat(result.get().getToken()).isEqualTo(token);
  }

  @Test
  @DisplayName("Should accept invitation")
  void shouldAcceptInvitation() {
    UUID id = UUID.randomUUID();
    UserInvitationsData data = new UserInvitationsData();
    UserInvitations entity =
        UserInvitations.builder().id(id).status(UserInvitationStatus.ACCEPTED).build();

    when(repository.findById(id)).thenReturn(Optional.of(data));
    when(mapper.toEntity(data)).thenReturn(entity);

    UserInvitations result = adapter.acceptedInvitation(id);

    assertThat(result).isNotNull();
    assertThat(result.getStatus()).isEqualTo(UserInvitationStatus.ACCEPTED);
    verify(repository).acceptedInvitation(id);
  }

  @Test
  @DisplayName("Should revoke invitation")
  void shouldRevokeInvitation() {
    UUID id = UUID.randomUUID();
    when(repository.revokeInvitation(id)).thenReturn(1);

    Boolean result = adapter.revokeInvitation(id);

    assertThat(result).isTrue();
    verify(repository).revokeInvitation(id);
  }
}
