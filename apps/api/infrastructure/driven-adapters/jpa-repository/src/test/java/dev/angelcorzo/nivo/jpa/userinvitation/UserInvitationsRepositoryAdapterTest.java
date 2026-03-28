package dev.angelcorzo.nivo.jpa.userinvitation;

import static org.assertj.core.api.Assertions.assertThat;

import dev.angelcorzo.nivo.jpa.tenants.TenantsRepositoryAdapter;
import dev.angelcorzo.nivo.jpa.tenants.mappers.TenantsMapperJpaImpl;
import dev.angelcorzo.nivo.jpa.userinvitation.mapper.UserInvitationsMapperJpaImpl;
import dev.angelcorzo.nivo.jpa.users.UserRepositoryAdapter;
import dev.angelcorzo.nivo.jpa.users.mapper.UserMapperJpaImpl;
import dev.angelcorzo.nivo.model.tenants.Tenants;
import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.model.userinvitations.UserInvitationStatus;
import dev.angelcorzo.nivo.model.userinvitations.UserInvitations;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import dev.angelcorzo.nivo.model.users.valueobject.UserReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.EmbeddedDatabaseConnection;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
@Import({
  UserInvitationsRepositoryAdapter.class,
  UserRepositoryAdapter.class,
  TenantsRepositoryAdapter.class,
  UserInvitationsMapperJpaImpl.class,
  UserMapperJpaImpl.class,
  TenantsMapperJpaImpl.class
})
@AutoConfigureTestDatabase(
    replace = AutoConfigureTestDatabase.Replace.NONE,
    connection = EmbeddedDatabaseConnection.NONE)
@DisplayName("UserInvitationsRepositoryAdapter Tests")
class UserInvitationsRepositoryAdapterTest {
  private final Tenants tenantDomain = Tenants.builder().companyName("Test Tenant").build();
  private final Users invitingUserDomain =
      Users.builder()
          .fullName("Inviting User")
          .email("inviter@test.com")
          .password("pass")
          .role(Roles.OWNER)
          .tenant(TenantReference.of(tenantDomain))
          .build();
  @Autowired private UserInvitationsRepositoryAdapter userInvitationsRepositoryAdapter;
  @Autowired private UserRepositoryAdapter userRepositoryAdapter;
  @Autowired private TenantsRepositoryAdapter tenantsRepositoryAdapter;
  private Tenants savedTenant;
  private UserInvitations invitation1;

  @BeforeEach
  void setUp() {
    savedTenant =
        tenantsRepositoryAdapter.save(Tenants.builder().companyName("Test Tenant").build());

    Users invitingUser =
        userRepositoryAdapter.save(
            Users.builder()
                .fullName("Inviting User")
                .email("inviter@test.com")
                .password("pass")
                .role(Roles.OWNER)
                .tenant(TenantReference.of(savedTenant))
                .build());

    invitation1 =
        userInvitationsRepositoryAdapter.save(
            UserInvitations.builder()
                .tenant(savedTenant)
                .invitedEmail("invited@test.com")
                .role(Roles.SUPERADMIN)
                .token(UUID.randomUUID())
                .status(UserInvitationStatus.PENDING)
                .invitedBy(UserReference.of(invitingUser))
                .expiredAt(OffsetDateTime.now().plusDays(7))
                .build());
  }

  @Nested
  @DisplayName("Save Operations")
  class SaveOperations {

    @Test
    @DisplayName("Should save a user invitation successfully")
    void shouldSaveUserInvitation() {
      // Given

      UserInvitations newInvitationModel =
          UserInvitations.builder()
              .tenant(savedTenant)
              .invitedEmail("newinvite@test.com")
              .role(Roles.OPERATOR)
              .token(UUID.randomUUID())
              .status(UserInvitationStatus.PENDING)
              .invitedBy(UserReference.of(invitingUserDomain))
              .expiredAt(OffsetDateTime.now().plusDays(7))
              .build();

      // When
      UserInvitations savedInvitation = userInvitationsRepositoryAdapter.save(newInvitationModel);

      // Then
      assertThat(savedInvitation).isNotNull();
      assertThat(savedInvitation.getId()).isNotNull();
      assertThat(savedInvitation.getInvitedEmail()).isEqualTo("newinvite@test.com");

      Optional<UserInvitations> found =
          userInvitationsRepositoryAdapter.findById(savedInvitation.getId());

      assertThat(found).isPresent();
      assertThat(found.get().getStatus()).isEqualTo(UserInvitationStatus.PENDING);
    }
  }

  @Nested
  @DisplayName("Find Operations")
  class FindOperations {

    @Test
    @DisplayName("Should find all invitations by tenant ID")
    void shouldFindAllInvitationsByTenantId() {
      // When
      List<UserInvitations> invitations =
          userInvitationsRepositoryAdapter.findAllInvitationsByTenantId(savedTenant.getId());

      // Then
      assertThat(invitations).isNotNull();
      assertThat(invitations.size()).isEqualTo(1);
      assertThat(invitations.getFirst().getId()).isEqualTo(invitation1.getId());
    }

    @Test
    @DisplayName("Should return empty list when no invitations for tenant ID")
    void shouldReturnEmptyListWhenNoInvitationsForTenant() {
      // When
      List<UserInvitations> invitations =
          userInvitationsRepositoryAdapter.findAllInvitationsByTenantId(UUID.randomUUID());

      // Then
      assertThat(invitations).isNotNull();
      assertThat(invitations).isEmpty();
    }

    @Test
    @DisplayName("Should find an invitation by token when it exists")
    void shouldFindInvitationByToken() {
      // When
      Optional<UserInvitations> found =
          userInvitationsRepositoryAdapter.findByToken(invitation1.getToken());

      // Then
      assertThat(found).isPresent();
      assertThat(found.get().getId()).isEqualTo(invitation1.getId());
    }

    @Test
    @DisplayName("Should not find an invitation by non-existent token")
    void shouldNotFindInvitationByNonExistentToken() {
      // When
      Optional<UserInvitations> found =
          userInvitationsRepositoryAdapter.findByToken(UUID.randomUUID());

      // Then
      assertThat(found).isNotPresent();
    }
  }

  @Nested
  @DisplayName("Update Operations")
  class UpdateOperations {

    @Test
    @DisplayName("Should accept a pending invitation")
    void shouldAcceptPendingInvitation() {
      // When
      UserInvitations accepted =
          userInvitationsRepositoryAdapter.acceptedInvitation(invitation1.getId());

      // Then
      assertThat(accepted).isNotNull();
      assertThat(accepted.getStatus()).isEqualTo(UserInvitationStatus.ACCEPTED);
      assertThat(accepted.getAcceptedAt()).isNotNull();

      Optional<UserInvitations> found =
          userInvitationsRepositoryAdapter.findById(invitation1.getId());
      assertThat(found).isPresent();
      assertThat(found.get().getStatus()).isEqualTo(UserInvitationStatus.ACCEPTED);
    }

    @Test
    @DisplayName("Should revoke a pending invitation")
    void shouldRevokePendingInvitation() {
      // When
      Boolean revoked = userInvitationsRepositoryAdapter.revokeInvitation(invitation1.getId());

      // Then
      assertThat(revoked).isTrue();

      Optional<UserInvitations> found =
          userInvitationsRepositoryAdapter.findById(invitation1.getId());
      assertThat(found).isPresent();
      assertThat(found.get().getStatus()).isEqualTo(UserInvitationStatus.REVOKED);
    }
  }
}
